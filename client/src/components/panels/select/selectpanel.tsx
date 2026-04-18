import { useMemo, useState } from "react";

import { CommunicativeMode } from "@atlasl2/shared";
import SearchDropdown from "../../search";
import { useAtlasContext } from "../../../context";
import {
  getCountryAutocompleteOptions, getLanguageAutocompleteOptions,
  toCountryDisplayName, toLanguageDisplayName
} from "../../../utils";

import "./selectpanel.css"

import type { BasePanelProps } from "../../../types";


export default function SelectPanel(props: BasePanelProps) {
  const { 
    selectedLanguages: languages, 
    selectedCountries: countries, 
    countryMetadata,
    languageMetadata,
    loading,
    mutualIntelligibilityMode,
    addLanguage,
    addCountry,
    removeLanguage, 
    removeCountry,
    setMutualIntelligibilityMode,
    isSelectPanelOpen: isOpen,
    setIsSelectPanelOpen: setIsOpen
  } = useAtlasContext();

  const [languageQuery, setLanguageQuery] = useState('');
  const [countryQuery, setCountryQuery] = useState('');

  const languageOptions = useMemo(
    () => getLanguageAutocompleteOptions(languageMetadata, languages, languageQuery),
    [languageMetadata, languages, languageQuery]
  );

  const countryOptions = useMemo(
    () => getCountryAutocompleteOptions(countryMetadata, countries, countryQuery),
    [countryMetadata, countries, countryQuery]
  );

  const handleLanguageSelect = (languageID: string) => {
    addLanguage(languageID);
    setLanguageQuery('');
  };

  const handleCountrySelect = (countryID: string) => {
    addCountry(countryID);
    setCountryQuery('');
  };

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
          <SearchDropdown
            value={languageQuery}
            placeholder={loading.metadata ? "Loading languages..." : "Search languages..."}
            options={languageOptions}
            onQueryChange={setLanguageQuery}
            onSelect={handleLanguageSelect}
          />
          <div className="chips">
            {languages.map(lang => (
              <span key={lang} className="chip">
                {toLanguageDisplayName(lang, languageMetadata)} 
                <button onClick={() => removeLanguage(lang)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>Selected Regions</h3>
          <SearchDropdown
            value={countryQuery}
            placeholder={loading.metadata ? "Loading regions..." : "Search regions..."}
            options={countryOptions}
            onQueryChange={setCountryQuery}
            onSelect={handleCountrySelect}
          />
          <div className="chips">
            {countries.map(country => (
              <span key={country} className="chip">
                {toCountryDisplayName(country, countryMetadata)}
                <button onClick={() => removeCountry(country)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="section modeRow">
          <label className="modeLabel" htmlFor="mutualIntelligibilityMode">Mutual Intelligibility:</label>
          <select
            id="mutualIntelligibilityMode"
            className="modeSelect"
            value={mutualIntelligibilityMode}
            onChange={(event) => setMutualIntelligibilityMode(Number(event.target.value) as CommunicativeMode)}
          >
            <option value={CommunicativeMode.None}>None</option>
            <option value={CommunicativeMode.Active}>Conversation</option>
            <option value={CommunicativeMode.Reception}>Reception</option>
            <option value={CommunicativeMode.Broadcast}>Broadcast</option>
          </select>
        </div>
      </div>
    </div>
  )
}
