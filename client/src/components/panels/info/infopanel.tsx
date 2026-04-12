import { useAtlasContext } from "../../../context";
import {
  buildSingleCountryOfficialLanguages, buildSingleCountryPrimaryScripts,
  computeCircleScore, computeCountriesOnlyTopFive, computeLanguageViewTitle,
  computeRegionalReachability, computeTopContributors, computeTotalSelectedPopulation
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
    focusedCountryId,
    countryMetadata, languageMetadata,
    reach, gap, explore,
    metadataLoading, reachLoading, gapLoading, exploreLoading
  } = useAtlasContext();

  const primaryCountryID = focusedCountryId ?? selectedCountries[0] ?? null;
  const primaryCountry = primaryCountryID ? countryMetadata[primaryCountryID] : null;
  const topContributors = computeTopContributors(reach);
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
  const circleScore = computeCircleScore(hasSingleCountry, primaryCountryID, reach);
  const circleScorePct = circleScore !== undefined ? Math.round(circleScore * 100) : null;
  const scoreDonutStyle = { '--score-pct': `${circleScorePct ?? 0}%` } as CSSProperties;

  const totalSelectedPopulation = computeTotalSelectedPopulation(selectedCountries, countryMetadata);
  const countriesOnlyTopFive = computeCountriesOnlyTopFive(
    selectedCountries,
    countryMetadata,
    explore,
    primaryCountryID,
    hasSingleCountry,
    totalSelectedPopulation
  );
  const scopePopulation = hasSingleCountry
    ? (primaryCountry?.population ?? totalSelectedPopulation)
    : totalSelectedPopulation;
  const { reachable: regionalReachablePopulation, unreachable: regionalUnreachablePopulation } = computeRegionalReachability(
    primaryCountry,
    primaryCountryID,
    reach
  );

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
              totalSelectedPopulation={totalSelectedPopulation}
              singleCountryOfficialLanguages={singleCountryOfficialLanguages}
              singleCountryPrimaryScripts={singleCountryPrimaryScripts}
              countriesOnlyTopFive={countriesOnlyTopFive}
              exploreLoading={exploreLoading}
              languageMetadata={languageMetadata}
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
              regionalReachablePopulation={regionalReachablePopulation}
              regionalUnreachablePopulation={regionalUnreachablePopulation}
              gapLoading={gapLoading}
              gap={gap}
              languageMetadata={languageMetadata}
              scopePopulation={scopePopulation}
              topContributors={topContributors}
              countryMetadata={countryMetadata}
              hasCountries={hasCountries}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
