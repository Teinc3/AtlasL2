import { useAtlasContext } from "../../../context";
import { toCountryDisplayName, toLanguageDisplayName } from "../../../utils";

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
  const hasLanguages = selectedLanguages.length > 0;
  const hasCountries = selectedCountries.length > 0;
  const hasSingleCountry = selectedCountries.length === 1;
  const showS0 = !hasLanguages && !hasCountries;
  const showS1 = !hasLanguages && hasCountries;
  const showLanguageView = hasLanguages;
  const languageViewTitle = !hasCountries
    ? 'Global Linguistic Footprint'
    : hasSingleCountry
      ? `Selected Country: ${primaryCountry?.name ?? toCountryDisplayName(selectedCountries[0], countryMetadata)}`
      : 'Selected Region';
  const circleScore = hasSingleCountry ? regionalScore : globalScore;
  const circleScorePct = circleScore !== undefined ? Math.round(circleScore * 100) : null;
  const scoreDonutStyle = { '--score-pct': `${circleScorePct ?? 0}%` } as CSSProperties;

  const totalSelectedPopulation = selectedCountries.reduce((sum, countryId) => {
    const population = countryMetadata[countryId]?.population ?? 0;
    return sum + population;
  }, 0);

  const singleCountryExplore = primaryCountryID ? (explore?.[primaryCountryID] ?? []) : [];
  const aggregatedExplore = Object.entries(
    selectedCountries.reduce<Record<string, number>>((acc, countryId) => {
      const countryPopulation = countryMetadata[countryId]?.population ?? 0;
      if (!countryPopulation) {
        return acc;
      }

      for (const entry of explore?.[countryId] ?? []) {
        acc[entry.lang] = (acc[entry.lang] ?? 0) + entry.prevalence * countryPopulation;
      }

      return acc;
    }, {})
  )
    .map(([lang, weightedPopulation]) => ({
      lang,
      prevalence: totalSelectedPopulation > 0 ? weightedPopulation / totalSelectedPopulation : 0,
    }))
    .sort((a, b) => b.prevalence - a.prevalence)
    .slice(0, 5);
  const countriesOnlyTopFive = hasSingleCountry
    ? singleCountryExplore.slice(0, 5)
    : aggregatedExplore;
  const scopePopulation = hasSingleCountry
    ? (primaryCountry?.population ?? totalSelectedPopulation)
    : totalSelectedPopulation;

  const formatGapRecommendation = (marginalGain: number) => {
    const percentGain = Math.round(marginalGain * 100);
    if (scopePopulation <= 0) {
      return `+${percentGain}%`;
    }

    const estimatedPopulationIncrease = Math.round(scopePopulation * marginalGain);
    return `+${percentGain}% (~${estimatedPopulationIncrease.toLocaleString()})`;
  };

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
            <div className="infoState">
              {hasSingleCountry ? (
                <h2>{primaryCountry?.name ?? 'No Country Selected'}</h2>
              ) : (
                <h3 className="text-center">{`Region Overview: ${selectedCountries.length} Countries`}</h3>
              )}
              <div className="statBlock">
                <h4>Total Population</h4>
                <div className="value">
                  {metadataLoading
                    ? 'Loading...'
                    : hasSingleCountry
                      ? (primaryCountry ? primaryCountry.population.toLocaleString() : 'N/A')
                      : totalSelectedPopulation.toLocaleString()
                  }
                </div>
              </div>
              <h4>Top Languages</h4>
              <ul className="breakdownList">
                {exploreLoading && <li>Loading...</li>}
                {!exploreLoading && countriesOnlyTopFive.length === 0 && (
                  <li>No language breakdown available.</li>
                )}
                {!exploreLoading && countriesOnlyTopFive.map((entry) => (
                  <li key={entry.lang}>
                    {toLanguageDisplayName(entry.lang, languageMetadata)}: {Math.round(entry.prevalence * 100)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={`stateWrapper ${showLanguageView ? 'active' : ''}`}>
          <div className="stateContent">
            <div className="infoState text-center">
              <h3>{languageViewTitle}</h3>

              <div
                className="scoreDonut"
                style={scoreDonutStyle}
              >
                <div className="scoreDonutInner">
                  {reachLoading ? '...' : (circleScorePct !== null ? circleScorePct : 'N/A')}
                </div>
              </div>
              <div className="metricLabel">Communicability Index</div>

              {hasSingleCountry ? (
                <>
                  <ul className="breakdownList text-left mt-4">
                    <li>Reachable: ~{regionalReachablePopulation.toLocaleString()}</li>
                    <li>Unreachable: ~{regionalUnreachablePopulation.toLocaleString()}</li>
                  </ul>
                  <h4 className="text-left mt-4">Useful Languages</h4>
                  <ul className="breakdownList text-left">
                    {gapLoading && <li>Loading...</li>}
                    {!gapLoading && (gap?.length ?? 0) === 0 && <li>No recommendations yet.</li>}
                    {!gapLoading && (gap ?? []).map((item) => (
                      <li key={item.lang}>
                        {toLanguageDisplayName(item.lang, languageMetadata)}: {formatGapRecommendation(item.marginalGain)}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
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
                  {hasCountries && (
                    <>
                      <h4 className="text-left mt-4">Useful Languages</h4>
                      <ul className="breakdownList text-left">
                        {gapLoading && <li>Loading...</li>}
                        {!gapLoading && (gap?.length ?? 0) === 0 && <li>No recommendations yet.</li>}
                        {!gapLoading && (gap ?? []).map((item) => (
                          <li key={item.lang}>
                            {toLanguageDisplayName(item.lang, languageMetadata)}: {formatGapRecommendation(item.marginalGain)}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
