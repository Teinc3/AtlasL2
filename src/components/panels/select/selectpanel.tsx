import { useState } from "react";

import "./selectpanel.css"


export default function SelectPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [languages, setLanguages] = useState(["English"]);
  const [countries, setCountries] = useState(["France", "Germany"]);

  const removeLanguage = (lang: string) => setLanguages(languages.filter(l => l !== lang));
  const removeCountry = (country: string) => setCountries(countries.filter(c => c !== country));

  return (
    <div className={`selectPanel ${isOpen ? 'open' : ''}`}>
      <div className="panelContent">
        <h2 className="panelLogo">AtlasL2</h2>
        
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
          <h3>Selected Countries</h3>
          <div className="inputWrapper">
            <input type="text" placeholder="Search countries..." />
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

      <div className="panelStud" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '◀' : '▶'}
      </div>
    </div>
  )
}
