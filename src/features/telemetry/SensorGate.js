/**
 * SensorGate.js
 * Handles strict physical proximity handshakes for the bike rental flow.
 */

/**
 * Calculates straight-line distance (in meters) between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 User Latitude
 * @param {number} lon1 User Longitude
 * @param {number} lat2 Bike Latitude
 * @param {number} lon2 Bike Longitude
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return Infinity;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c);
}

/**
 * Simulates a Bluetooth Low Energy (BLE) handshake with the specific bike hardware.
 * Upgraded to use REAL Web Bluetooth API if available.
 * @param {string} bikeId 
 * @returns {Promise<boolean>}
 */
export async function simulateBluetoothScan(bikeId) {
  // ── REAL BLUETOOTH REQUEST DISABLED FOR SOFTWARE SIMULATION ──
  /*
  if ('bluetooth' in navigator) {
    try {
      console.log(`[BT] Attempting real handshake with: ${bikeId}`);
      await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'BIKE-' }],
        optionalServices: ['battery_service']
      });
      return true;
    } catch (err) {
      console.warn("Real Bluetooth Prompt Failed/Cancelled:", err.name);
      if (err.name === 'NotFoundError' || err.name === 'SecurityError') {
         return false;
      }
    }
  }
  */

  // Fallback / Simulation delay for non-BLE environments/browsers
  return new Promise((resolve) => {
    const scanTime = Math.floor(Math.random() * 500) + 1000;
    setTimeout(() => {
      resolve(true);
    }, scanTime);
  });
}

/**
 * Simulates an ESP32 command to unlock a Docking Station (Servo to 90 degrees)
 * @param {string} dockId 
 */
export async function simulateDockUnlock(dockId) {
  console.log(`[ESP32-DOCK] Initiating UNLOCK on ${dockId}...`);
  await new Promise(r => setTimeout(r, 800));
  console.log(`[ESP32-DOCK] Servo moved to 90°. Bike Released from ${dockId}.`);
  return true;
}

/**
 * Simulates an ESP32 command to lock a Docking Station (Servo to 0 degrees)
 * @param {string} dockId 
 */
export async function simulateDockLock(dockId) {
  console.log(`[ESP32-DOCK] Initiating LOCK on ${dockId}...`);
  await new Promise(r => setTimeout(r, 800));
  console.log(`[ESP32-DOCK] Servo moved to 0°. Bike Secured in ${dockId}.`);
  return true;
}

/**
 * Simulates fallback connectivity (BLE vs GSM SIM800L)
 * BLE used for short range, GSM used for long range / admin commands
 */
export async function sendCommandViaFallback(targetId, command, distanceInMeters) {
  const protocol = distanceInMeters < 50 ? 'BLE (Proximity)' : 'GSM/SIM800L (Long Range)';
  console.log(`[CONNECTIVITY] Sending '${command}' to ${targetId} via ${protocol}`);
  await new Promise(r => setTimeout(r, 1000)); // Network delay
  return true;
}
