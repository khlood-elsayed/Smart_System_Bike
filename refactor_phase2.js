const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/SmartBikeApp.jsx', 'utf-8');
const lines = content.split('\n');

// Folders
fs.mkdirSync('src/components/common', { recursive: true });
fs.mkdirSync('src/features/telemetry', { recursive: true });
fs.mkdirSync('src/features/security', { recursive: true });
fs.mkdirSync('src/screens', { recursive: true });

// We need to parse top-level functions and constants.
const componentsMap = {}; // name -> content
let currentComponent = null;
let currentContent = [];

// There is a block of constants from line 22 to 42 (0-indexed 21 to 41)
// Let's just do a naive read of the file.
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Exclude early imports
    if (line.startsWith('import ')) continue;

    const funcMatch = line.match(/^function ([A-Za-z0-9_]+)\(/) || line.match(/^export default function ([A-Za-z0-9_]+)\(/);

    if (funcMatch && !currentComponent && !line.includes('pointInPolygon')) {
        currentComponent = funcMatch[1];
        currentContent = [line];
        continue;
    }

    if (currentComponent) {
        currentContent.push(line);
        // if it's the closing brace at column 0, component ends
        if (line === '}' || line === '};') {
            componentsMap[currentComponent] = currentContent.join('\n');
            currentComponent = null;
            currentContent = [];
        }
    }
}

// Extract geofence logic manually, it's between `// ===== LEAFLET MAP` and `function LeafletMap`
let geofenceLogic = '';
let inGeofence = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// ===== LEAFLET MAP COMPONENT')) {
        inGeofence = true;
    }
    if (lines[i].startsWith('function LeafletMap')) {
        inGeofence = false;
        break;
    }
    if (inGeofence && !lines[i].includes('// ===== LEAFLET MAP COMPONENT')) {
        geofenceLogic += lines[i] + '\n';
    }
}
// Export geofence constants/functions
geofenceLogic = geofenceLogic
    .replace('const DAMIETTA_GEOFENCE', 'export const DAMIETTA_GEOFENCE')
    .replace('const DAMIETTA_BIKES', 'export const DAMIETTA_BIKES')
    .replace('function pointInPolygon', 'export function pointInPolygon');

fs.writeFileSync('src/features/telemetry/geofence.js', geofenceLogic);

// Extract NotificationHelpers manually
let notificationLogic = '';
let inNotification = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// OTP & Notification Helpers')) {
        inNotification = true;
    }
    if (lines[i].startsWith('function LoginScreen')) {
        inNotification = false;
        break;
    }
    if (inNotification && !lines[i].includes('// OTP & Notification Helpers')) {
        notificationLogic += lines[i] + '\n';
    }
}
notificationLogic = notificationLogic
    .replace('function requestNotificationPermission', 'export function requestNotificationPermission')
    .replace('function sendOtpNotification', 'export function sendOtpNotification');

fs.writeFileSync('src/features/security/NotificationHelper.js', notificationLogic);

// Base import string for all React components
const BASE_IMPORTS = `import React, { useState, useEffect, useRef } from "react";\nimport { LIME, DARK } from '../../constants/theme.js';\nimport * as Icons from '../../assets/icons';\n`;

// Write StatusBar, BackBtn
fs.writeFileSync('src/components/common/StatusBar.jsx', BASE_IMPORTS + `\nexport default \n` + componentsMap['StatusBar']);
fs.writeFileSync('src/components/common/BackBtn.jsx', BASE_IMPORTS + `\nexport default \n` + componentsMap['BackBtn']);

// Write LeafletMap
fs.writeFileSync('src/features/telemetry/LeafletMap.jsx', BASE_IMPORTS.replace('../../', '../') + `import { DAMIETTA_GEOFENCE } from './geofence';\n\nexport default \n` + componentsMap['LeafletMap']);

// Identify screens
const screens = Object.keys(componentsMap).filter(name =>
    name !== 'App' && name !== 'StatusBar' && name !== 'BackBtn' && name !== 'LeafletMap' && name !== 'pointInPolygon'
);

for (const screen of screens) {
    let imports = `import React, { useState, useEffect, useRef } from "react";\nimport { LIME, DARK } from '../../constants/theme.js';\nimport * as Icons from '../../assets/icons';\nimport StatusBar from '../../components/common/StatusBar';\nimport BackBtn from '../../components/common/BackBtn';\n`;

    if (componentsMap[screen].includes('LeafletMap')) {
        imports += `import LeafletMap from '../../features/telemetry/LeafletMap';\n`;
    }
    if (componentsMap[screen].includes('DAMIETTA_BIKES')) {
        imports += `import { DAMIETTA_BIKES, DAMIETTA_GEOFENCE, pointInPolygon } from '../../features/telemetry/geofence';\n`;
    }
    if (componentsMap[screen].includes('requestNotificationPermission')) {
        imports += `import { requestNotificationPermission, sendOtpNotification } from '../../features/security/NotificationHelper';\n`;
    }

    // Create subfolders for neatness, or just dump in screens/
    fs.writeFileSync(`src/screens/${screen}.jsx`, imports + `\nexport default \n` + componentsMap[screen]);
}

// Generate the new SmartBikeApp.jsx
// It should only import the necessary components and render App
let finalAppCode = `import React, { useState, useEffect } from "react";\nimport './styles/main.css';\n`;
finalAppCode += screens.map(s => `import ${s} from './screens/${s}';\n`).join('');
finalAppCode += `\nexport default \n` + componentsMap['App'];

fs.writeFileSync('src/SmartBikeApp.jsx', finalAppCode);
console.log('Phase 2 complete! Screens built:', screens.length);
