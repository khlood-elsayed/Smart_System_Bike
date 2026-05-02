const fs = require('fs');

const content = fs.readFileSync('src/SmartBikeApp.jsx', 'utf-8');
const lines = content.split('\n');

// 1. theme.js
const themeJs = `export const LIME = "#CCFF00";\nexport const DARK = "#111111";\n`;
fs.mkdirSync('src/constants', { recursive: true });
fs.writeFileSync('src/constants/theme.js', themeJs);

// 2. index.jsx (icons)
fs.mkdirSync('src/assets/icons', { recursive: true });
let iconsContent = `import React from 'react';\nimport { LIME, DARK } from '../../constants/theme.js';\n\n`;

// Extract icons from lines 6 to 191 (index 5 to 190)
let iconLines = lines.slice(5, 191);
iconsContent += iconLines.join('\n').replace(/const ([A-Za-z0-9_]+) =/g, 'export const $1 =');
fs.writeFileSync('src/assets/icons/index.jsx', iconsContent);

// 3. main.css
fs.mkdirSync('src/styles', { recursive: true });
// Extract styles from line 193 to 980 (index 192 to 979)
let cssLines = lines.slice(192, 979);
// Remove the first and last line which contain the backticks
cssLines = cssLines.slice(1, -1);
let cssContent = `:root {\n  --lime: #CCFF00;\n  --dark: #111111;\n}\n\n` + cssLines.join('\n')
    .replace(/\$\{LIME\}/g, 'var(--lime)')
    .replace(/\$\{DARK\}/g, 'var(--dark)');
fs.writeFileSync('src/styles/main.css', cssContent);

// 4. Update SmartBikeApp.jsx
// Need to replace lines 2 to 981 with imports.
// Also need to use the Icons namespace in the rest of the file
let newLines = [
    lines[0], // import { useState, useEffect, useRef } from "react";
    `import { LIME, DARK } from './constants/theme.js';`,
    `import * as Icons from './assets/icons';`,
    `import './styles/main.css';`,
    ...lines.slice(981) // From line 982: // ==== COMPONENTS ====
];
let newAppContent = newLines.join('\n');

// Replace icon usages with Icons.IconName
const iconNames = [
    "BikeLogo", "PhoneIcon", "MailIcon", "CheckIcon", "AlertIcon", "CameraIcon", "LockIcon", "EyeIcon",
    "LocationIcon", "UserSettingsIcon", "WalletIcon", "MenuIcon", "BellIcon", "RefreshIcon", "HeadsetIcon",
    "BikeIconSVG", "QRScanIcon", "BatteryIconSVG", "PadlockIcon", "EditProfileIcon", "KeyIcon2", "WhatsAppIcon",
    "SMSIcon", "ShieldCheckIcon", "IdCardIcon"
];

for (const iconName of iconNames) {
    // Replace <IconName .../> with <Icons.IconName .../>
    const regex = new RegExp(`<${iconName}\\b`, 'g');
    newAppContent = newAppContent.replace(regex, `<Icons.${iconName}`);
}

fs.writeFileSync('src/SmartBikeApp.jsx', newAppContent);
console.log('Phase 1 refactoring complete!');
