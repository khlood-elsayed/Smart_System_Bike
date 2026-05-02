import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../../constants/theme.js';
import * as Icons from '../../assets/Icons.jsx';
import { DAMIETTA_BIKES, DAMIETTA_CENTER, DAMIETTA_RADIUS, isWithinServiceZone } from './geofence';

export default
  function LeafletMap({ bikes = [], docks = [], onBikeClick, selectedBike, userLocation, nearestDock, followUser }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userLayerRef = useRef(null);
  const nearestHighlightLayerRef = useRef(null);
  const dataKeyRef = useRef("");
  const onBikeClickRef = useRef(onBikeClick);

  // ── Keep callback ref fresh ──
  useEffect(() => { onBikeClickRef.current = onBikeClick; }, [onBikeClick]);

  // ── Track map readiness so marker effects can depend on it ──
  const [mapReady, setMapReady] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // 1. INIT MAP — loads Leaflet script if needed, then creates map
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;
      if (!L) return;

      // Center on Damietta city
      const map = L.map(mapRef.current, {
        center: [31.4175, 31.8140], // Damietta center
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
        closePopupOnClick: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // ── Service Zone: Covers ALL of Damietta Governorate ──
      // (Damietta city, New Damietta, Ras El Bar, Kafr Saad, Faraskour, Zarqa, etc.)
      L.circle([31.4175, 31.8140], {
        radius: 25000, // 25 km — covers the entire governorate
        color: LIME,
        weight: 2,
        fillColor: LIME,
        fillOpacity: 0.05,
        dashArray: '10,10',
        interactive: false,
      }).addTo(map);

      // Initialize Layer Groups (order matters: highlight → markers → user)
      nearestHighlightLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // ── BOMB-PROOF EVENT DELEGATION for popup buttons ──
      map.on('popupopen', (e) => {
        const container = e.popup._container;
        if (!container) return;
        const btn = container.querySelector('.direct-scan-btn');
        if (btn) {
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
          newBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const bikeId = newBtn.getAttribute('data-bike-id');
            console.log("[Map] Select bike clicked for:", bikeId);
            map.closePopup();
            setTimeout(() => {
              onBikeClickRef.current && onBikeClickRef.current(bikeId);
            }, 50);
          });
        }
      });

      // Force re-layout then fit all docks into view
      setTimeout(() => {
        map.invalidateSize();
        const dockCoords = (docks || []).filter(d => d.lat && d.lng).map(d => [d.lat, d.lng]);
        if (dockCoords.length > 0) {
          map.fitBounds(L.latLngBounds(dockCoords).pad(0.15), { maxZoom: 14 });
        }
      }, 400);

      // ★★★ Signal that the map is ready — this triggers marker rendering ★★★
      setMapReady(true);
    };

    if (window.L) initMap();
    else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 2. RENDER DOCK & BIKE MARKERS — depends on mapReady!
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!mapReady) return; // ← crucial: wait for map to exist
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    const L = window.L;
    if (!map || !layer || !L) return;

    // Only re-render if data actually changed
    const currentKey = JSON.stringify({ bikes, docks, selectedBike });
    if (currentKey === dataKeyRef.current) return;
    dataKeyRef.current = currentKey;

    layer.clearLayers();

    // ── Bike markers (only unlocked bikes) ──
    const bikeIcon = (isSelected, status) => {
      const color = status === 'available' ? LIME : '#22d3ee';
      return L.divIcon({
        className: '',
        html: `<div style="width:40px;height:40px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:${isSelected ? `0 0 0 3px white,0 0 0 5px ${color}` : '0 3px 10px rgba(0,0,0,0.25)'};border:2px solid #111;">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" style="transform:rotate(45deg)"><circle cx="13" cy="32" r="8" stroke="#111" stroke-width="2.5"/><circle cx="35" cy="32" r="8" stroke="#111" stroke-width="2.5"/><path d="M13 24L22 12L35 24" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>`,
        iconAnchor: [20, 40],
        popupAnchor: [0, -42],
      });
    };

    const bikesToShow = (bikes.length > 0 ? bikes : DAMIETTA_BIKES);
    bikesToShow.forEach((b) => {
      if (!b.lat || !b.lng) return;
      L.marker([b.lat, b.lng], { icon: bikeIcon(selectedBike === b.id, b.status) })
        .addTo(layer)
        .on('click', () => onBikeClickRef.current && onBikeClickRef.current(b.id));
    });

    // ── Dock markers (ALWAYS show all 3 docks) ──
    const dockIcon = () => L.divIcon({
      className: '',
      html: `<div style="width:34px;height:34px;background:#007AFF;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,122,255,0.4);border:2.5px solid white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      </div>`,
      iconAnchor: [17, 34],
      popupAnchor: [0, -36],
    });

    console.log("[LeafletMap] Rendering", docks.length, "docks:", docks.map(d => d.name));

    docks.forEach((d) => {
      if (!d.lat || !d.lng) return;
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = "'Space Grotesk', sans-serif";
      popupDiv.innerHTML = `
        <div style="font-weight:800; font-size:15px; color:#111;">${d.name} Center</div>
        <div style="font-size:11px; color:#888; margin-bottom:10px; font-weight:600;">DOCK ID: ${d.id}</div>
        ${d.occupiedBy ? `
          <div style="background:#f5ffe0; padding:12px; border-radius:12px; border:1px solid #c5e1a5; display:flex; flex-direction:column; gap:8px;">
            <div style="font-size:12px; color:#2e7d32; font-weight:700;">Bike #${d.occupiedBy} is docked here</div>
            <button 
              class="direct-scan-btn" 
              data-bike-id="${d.occupiedBy}" 
              style="width:100%; background:#007AFF; color:white; border:none; padding:12px; border-radius:12px; cursor:pointer; font-weight:900; font-size:14px; font-family:'Space Grotesk', sans-serif; box-shadow:0 4px 12px rgba(0,122,255,0.3);"
            >
              Select Bike
            </button>
          </div>
        ` : '<div style="color:#007AFF; font-size:13px; font-weight:800; padding:8px; background:#f0f7ff; border-radius:8px; text-align:center;">EMPTY DOCK</div>'}
      `;

      L.marker([d.lat, d.lng], { icon: dockIcon() })
        .addTo(layer)
        .bindPopup(popupDiv, { autoClose: false, closeOnClick: false, maxWidth: 220, className: 'premium-popup' });
    });

  }, [mapReady, bikes, docks, selectedBike]);

  // ═══════════════════════════════════════════════════════════════
  // 3. USER LOCATION DOT (no map panning)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!mapReady) return;
    const layer = userLayerRef.current;
    const L = window.L;
    if (!layer || !L || !userLocation) return;
    if (userLocation.lat === 0 && userLocation.lng === 0) return;

    layer.clearLayers();
    L.circleMarker([userLocation.lat, userLocation.lng], { radius: 18, fillColor: '#007AFF', color: 'transparent', fillOpacity: 0.15, interactive: false }).addTo(layer);
    L.circleMarker([userLocation.lat, userLocation.lng], { radius: 7, fillColor: '#007AFF', color: '#fff', weight: 2.5, fillOpacity: 1, interactive: false }).addTo(layer);

    if (followUser && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1 });
    }
  }, [mapReady, userLocation, followUser]);

  // ═══════════════════════════════════════════════════════════════
  // 4. NEAREST DOCK HIGHLIGHT (Pulsing Ring + Fly To)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    const layer = nearestHighlightLayerRef.current;
    const L = window.L;
    if (!layer || !L) return;

    layer.clearLayers();
    if (!nearestDock || !nearestDock.lat || !nearestDock.lng) return;

    if (map) map.flyTo([nearestDock.lat, nearestDock.lng], 17, { duration: 1.2 });

    const pulseIcon = L.divIcon({
      className: '',
      html: `
        <div class="nearest-dock-ring">
          <div class="nearest-dock-inner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>`,
      iconSize: [80, 80],
      iconAnchor: [40, 40],
    });

    L.marker([nearestDock.lat, nearestDock.lng], { icon: pulseIcon, interactive: false }).addTo(layer);
  }, [mapReady, nearestDock]);

  // ═══════════════════════════════════════════════════════════════
  // 5. CLEANUP on unmount
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: 200, background: '#e8eaf0', zIndex: 1 }}
    />
  );
}