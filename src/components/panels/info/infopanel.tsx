import { useState } from "react"

import "./infopanel.css"

import type { BasePanelProps } from "../../../types/props.types";


export default function InfoPanel(props: BasePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeState, setActiveState] = useState(0);

  return (
    <div 
      className={`infoPanelContainer ${isOpen ? 'open' : ''}`}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <button className="icon-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '—' : 'i'}
      </button>

      <div className="infoPanelContent">
        {/* Temporary State Switcher for Dev */}
        <div className="devStateSwitcher">
          {[0,1,2,3].map(s => (
            <button 
              key={s} 
              onClick={() => setActiveState(s)} 
              className={activeState === s ? 'active' : ''}
            >S{s}</button>
          ))}
        </div>

        <div className={`stateWrapper ${activeState === 0 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState helperState">
              <p>
                Select language(s) to view corresponding communicability scores,
                or select a specific country or region to view its linguistic profile.
              </p>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${activeState === 1 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState">
              <h2>France</h2>
              <div className="statBlock">
                <div className="label">Total Population</div>
                <div className="value">67,000,000</div>
              </div>
              <h3>Linguistic Landscape</h3>
              <ul>
                <li>French (Official)</li>
                <li>English (39%)</li>
                <li>Spanish (13%)</li>
                <li>Arabic (6%)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${activeState === 2 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState text-center">
              <h3>Selected Region: France</h3>
              <div className="bigMetric">
                <span className="metricValue">65/100</span>
                <span className="metricLabel">Regional Communicability</span>
              </div>
              <div className="cssDonutPlaceholder"></div>
              <ul className="breakdownList text-left">
                <li>Reachable: 43.5M</li>
                <li>Unreachable: 23.5M</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${activeState === 3 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState text-center">
              <h3>Global Linguistic Footprint</h3>
              <div className="bigMetric">
                <span className="metricValue">18/100</span>
                <span className="metricLabel">Global Communicability</span>
              </div>
              <div className="cssDonutPlaceholder"></div>
              
              <h4 className="text-left mt-4">Top Contributing Regions</h4>
              <div className="barChartPlaceholder">
                <div className="barRow">
                  <span className="barLabel">USA</span>
                  <div className="barTrack">
                    <div className="barFill" style={{width: '80%'}}></div>
                  </div>
                </div>
                <div className="barRow">
                  <span className="barLabel">IND</span>
                  <div className="barTrack">
                    <div className="barFill" style={{width: '60%'}}></div>
                  </div>
                </div>
                <div className="barRow">
                  <span className="barLabel">NGA</span>
                  <div className="barTrack">
                    <div className="barFill" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
