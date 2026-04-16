import { useAtlasContext } from "../../../context";
import {
  buildSingleCountryOfficialLanguages, buildSingleCountryPrimaryScripts,
  computeLanguageViewTitle
} from "../../../utils";
import { CountriesOnlyStateView, LanguageViewState } from "./infoviews";

import "./infopanel.css"

import type { CSSProperties } from "react";
import type { BasePanelProps } from "../../../types";


export default function InfoPanel(props: BasePanelProps) {
  const {
    isInfoPanelOpen: isOpen,
    setIsInfoPanelOpen: setIsOpen,
    selectedCountries, selectedLanguages,
    addLanguage, addCountry,
    focusedCountryId,
    countryMetadata, languageMetadata,
    reach, gap, explore,
    metadataLoading, reachLoading, gapLoading, exploreLoading
  } = useAtlasContext();

  const primaryCountryID = focusedCountryId ?? selectedCountries[0] ?? null;
  const primaryCountry = primaryCountryID ? countryMetadata[primaryCountryID] : null;
  const hasLanguages = selectedLanguages.length > 0;
  const hasCountries = selectedCountries.length > 0;
  const hasSingleCountry = selectedCountries.length === 1;
  const showS0 = !hasLanguages && !hasCountries;
  const showS1 = !hasLanguages && hasCountries;
  const showLanguageView = hasLanguages;
  const languageViewTitle = computeLanguageViewTitle(
    hasCountries,
    hasSingleCountry,
    primaryCountry,
    selectedCountries,
    countryMetadata
  );
  const primaryCountryReach = primaryCountryID ? reach?.breakdown[primaryCountryID] : undefined;
  const circleScore = hasSingleCountry ? primaryCountryReach?.score : reach?.globalIndex;
  const circleScorePct = circleScore !== undefined ? Math.round(circleScore * 100) : null;
  const scoreDonutStyle = { '--score-pct': `${circleScorePct ?? 0}%` } as CSSProperties;

  const scriptDisplayNames = new Intl.DisplayNames(['en'], { type: 'script' })
  const englishLanguageDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' })
  const singleCountryOfficialLanguages = hasSingleCountry
    ? buildSingleCountryOfficialLanguages(primaryCountry, languageMetadata, englishLanguageDisplayNames)
    : [];
  const singleCountryPrimaryScripts = hasSingleCountry
    ? buildSingleCountryPrimaryScripts(primaryCountry, scriptDisplayNames)
    : [];

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
        <div className={`stateWrapper ${showS0 ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState helperState">
              <p>
                Select language(s) to view corresponding communicability scores,
                or select a specific country or region to view its linguistic profile.
              </p>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${showS1 ? 'active' : ''}`}>
          <div className="stateContent">
            <CountriesOnlyStateView
              hasSingleCountry={hasSingleCountry}
              primaryCountry={primaryCountry}
              selectedCountriesCount={selectedCountries.length}
              metadataLoading={metadataLoading}
              selectedPopulation={explore?.selectedPopulation ?? 0}
              singleCountryOfficialLanguages={singleCountryOfficialLanguages}
              singleCountryPrimaryScripts={singleCountryPrimaryScripts}
              topLanguages={explore?.topLanguages ?? []}
              exploreLoading={exploreLoading}
              languageMetadata={languageMetadata}
              onAddLanguage={addLanguage}
            />
          </div>
        </div>

        <div className={`stateWrapper ${showLanguageView ? 'active' : ''}`}>
          <div className="stateContent">
            <LanguageViewState
              languageViewTitle={languageViewTitle}
              scoreDonutStyle={scoreDonutStyle}
              reachLoading={reachLoading}
              circleScorePct={circleScorePct}
              hasSingleCountry={hasSingleCountry}
              regionalReachablePopulation={primaryCountryReach?.reachable ?? 0}
              regionalUnreachablePopulation={primaryCountryReach?.unreachable ?? 0}
              gapLoading={gapLoading}
              gap={gap}
              languageMetadata={languageMetadata}
              topContributors={reach?.topContributingRegions ?? []}
              countryMetadata={countryMetadata}
              hasCountries={hasCountries}
              onAddLanguage={addLanguage}
              onAddCountry={addCountry}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
