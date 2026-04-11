import "./hoverpanel.css"

import type { HoverPanelProps } from "../../../types";


export default function HoverPanel(props: HoverPanelProps) {
  const SAFE_ZONE_PADDING = 24;
  const VISUAL_GAP = 10;
  const POSITION_OFFSET = VISUAL_GAP - SAFE_ZONE_PADDING;

  const {
    x, y,
    countryName, population, continent, flag, isVisible, communicabilityIndex,
    onClose, onMouseEnter, onMouseLeave
  } = props;

  if (!isVisible) {
    return null;
  }

  const winWidth = window.innerWidth;
  const winHeight =  window.innerHeight;
  const isRightHalf = x > winWidth / 2;
  const isBottomHalf = y > winHeight / 2;

  // Render logic
  const leftPos = isRightHalf ? x - POSITION_OFFSET : x + POSITION_OFFSET;
  const topPos = isBottomHalf ? y - POSITION_OFFSET : y + POSITION_OFFSET;
  const transform = `translate(${isRightHalf ? '-100%' : '0'}, ${isBottomHalf ? '-100%' : '0'})`;

  return (
    <div 
      className="hoverPanelWrapper"
      style={{ left: leftPos, top: topPos, transform, padding: SAFE_ZONE_PADDING }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Invisible safe zone padding for smooth mouse traversal */}
      <div className="hoverPanelSafeZone" />

      <div className="hoverPanelContainer">
        <div className="hoverHeader">
          <div className="hoverHeaderGroup">
            <span className="hoverFlag">{flag ?? '🏳️'}</span>
            <h3 className="hoverCountryName">{countryName}</h3>
          </div>
          <button className="hoverCloseBtn" onClick={onClose}>—</button>
        </div>
        
        <div className="hoverDetails">
          <div className="hoverRow">
            <span className="hoverLabel">Population:</span>
            <span className="hoverValue">{population.toLocaleString()}</span>
          </div>
          <div className="hoverRow">
            <span className="hoverLabel">Region:</span>
            <span className="hoverValue">{continent}</span>
          </div>
          {communicabilityIndex !== undefined && (
            <div className="hoverRow">
              <span className="hoverLabel">Communicability:</span>
              <span className="hoverValue">{(communicabilityIndex * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
