import { useAtlasContext } from "../../../context";
import { CountriesOnlyStateView, LanguageViewState } from "./infoviews";

import "./infopanel.css"

import type { BasePanelProps } from "../../../types";


export default function InfoPanel(props: BasePanelProps) {
  const {
    isInfoPanelOpen: isOpen,
    setIsInfoPanelOpen: setIsOpen,
    selectedCountries, selectedLanguages,
  } = useAtlasContext();

  const hasLanguages = selectedLanguages.length > 0;
  const hasCountries = selectedCountries.length > 0;

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
        <div className={`stateWrapper ${!hasLanguages && !hasCountries ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState helperState">
              <p>
                Select language(s) to view corresponding communicability scores,
                or select a specific country or region to view its linguistic profile.
              </p>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${!hasLanguages && hasCountries ? 'active' : ''}`}>
          <div className="stateContent">
            <CountriesOnlyStateView />
          </div>
        </div>

        <div className={`stateWrapper ${hasLanguages ? 'active' : ''}`}>
          <div className="stateContent">
            <LanguageViewState />
          </div>
        </div>

      </div>
    </div>
  )
}
