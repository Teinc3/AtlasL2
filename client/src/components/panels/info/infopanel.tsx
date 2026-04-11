import { useState } from "react";

import { useAtlasContext } from "../../../context";
import { toCountryDisplayName, toLanguageDisplayName } from "../../../utils";

import "./infopanel.css"

import type { BasePanelProps } from "../../../types";


export default function InfoPanel(props: BasePanelProps) {
  const {
    isInfoPanelOpen: isOpen,
    setIsInfoPanelOpen: setIsOpen,
    selectedCountries,
    selectedLanguages,
    focusedCountryId,
    countryMetadata,
    languageMetadata,
    reach,
    metadataLoading,
  } = useAtlasContext();
  const [activeState, setActiveState] = useState(0);

  const primaryCountryID = focusedCountryId ?? selectedCountries[0] ?? null;
  const primaryCountry = primaryCountryID ? countryMetadata[primaryCountryID] : null;
  const regionalScore = primaryCountryID ? reach?.breakdown[primaryCountryID] : undefined;
  const regionalReachablePopulation = primaryCountry && regionalScore !== undefined
    ? Math.round(primaryCountry.population * regionalScore)
    : 0;
  const regionalUnreachablePopulation = primaryCountry && regionalScore !== undefined
    ? Math.max(0, primaryCountry.population - regionalReachablePopulation)
    : 0;
  const globalScore = reach?.globalIndex;
  const topContributors = Object.entries(reach?.breakdown ?? {})
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 3);

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
              <h2>{primaryCountry?.name ?? 'No Country Selected'}</h2>
              <div className="statBlock">
                <div className="label">Total Population</div>
                <div className="value">
                  {metadataLoading
                    ? 'Loading...'
                    : primaryCountry
                    ? primaryCountry.population.toLocaleString()
                    : 'N/A'
                  }
                </div>
              </div>
                <h3>Active Language Selection</h3>
              <ul>
                {selectedLanguages.length === 0 && <li>No languages selected.</li>}
                  {selectedLanguages.map((languageID) => (
                    <li key={languageID}>{toLanguageDisplayName(languageID, languageMetadata)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${activeState === 2 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState text-center">
              <h3>Selected Region: {primaryCountry?.name ?? 'None'}</h3>
              <div className="bigMetric">
                <span className="metricValue">
                  {regionalScore !== undefined ? `${Math.round(regionalScore * 100)}/100` : 'N/A'}
                </span>
                <span className="metricLabel">Regional Communicability</span>
              </div>
              <div className="cssDonutPlaceholder"></div>
              <ul className="breakdownList text-left">
                <li>Reachable: {regionalReachablePopulation.toLocaleString()}</li>
                <li>Unreachable: {regionalUnreachablePopulation.toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${activeState === 3 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState text-center">
              <h3>Global Linguistic Footprint</h3>
              <div className="bigMetric">
                <span className="metricValue">
                  {globalScore !== undefined ? `${Math.round(globalScore * 100)}/100` : 'N/A'}
                </span>
                <span className="metricLabel">Global Communicability</span>
              </div>
              <div className="cssDonutPlaceholder"></div>
              
              <h4 className="text-left mt-4">Top Contributing Regions</h4>
              <div className="barChartPlaceholder">
                {topContributors.length === 0 && <div className="barRow">No data yet.</div>}
                {topContributors.map(([countryID, score]) => (
                  <div className="barRow" key={countryID}>
                    <span className="barLabel">{toCountryDisplayName(countryID, countryMetadata)}</span>
                    <div className="barTrack">
                      <div className="barFill" style={{ width: `${Math.round(score * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
