import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../../constants/theme.js';
import * as Icons from '../../assets/Icons.jsx';

export default 
function BackBtn({ onBack, light = false }) {
  return (
    <button className="back-btn" onClick={onBack} style={{ color: light ? "white" : DARK }}>
      ←
    </button>
  );
}