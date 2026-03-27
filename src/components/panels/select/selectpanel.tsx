import { useState } from "react";

import "./selectpanel.css"

import type { BasePanelProps } from "../../../types/props.types";


export default function SelectPanel(props: BasePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [languages, setLanguages] = useState(["English"]);
  const [countries, setCountries] = useState(["France", "Germany"]);

  const removeLanguage = (lang: string) => setLanguages(languages.filter(l => l !== lang));
  const removeCountry = (country: string) => setCountries(countries.filter(c => c !== country));

  return (
    <div 
      className={`selectPanelContainer ${isOpen ? 'open' : ''}`}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <div className="selectPanelHeader">
        {isOpen && 
          <h2 className="panelLogo">AtlasL2</h2>
        }
        <button className="icon-btn shift-up" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '—' : '☰'}
          </button>
        </div>
      
      <div className="selectPanelContent">
        <div className="section">
          <h3>Active Languages</h3>
          <div className="inputWrapper">
            <input type="text" placeholder="Search languages..." />
            {/* Dropdown would position here */}
          </div>
          <div className="chips">
            {languages.map(lang => (
              <span key={lang} className="chip">
                {lang} <button onClick={() => removeLanguage(lang)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>Selected Regions</h3>
          <div className="inputWrapper">
            <input type="text" placeholder="Search regions..." />
            {/* Dropdown would position here */}
          </div>
          <div className="chips">
            {countries.map(country => (
              <span key={country} className="chip">
                {country} <button onClick={() => removeCountry(country)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
