import { useInfoScope } from "../../../hooks";
import {
  buildSingleCountryOfficialLanguages, buildSingleCountryPrimaryScripts,
  toCountryDisplayName, toLanguageDisplayName
} from "../../../utils";
import { 
  formatCompactPopulation, formatGapRecommendation, formatPPPBillions, formatPPPPerCapita
} from "../../../utils";

import type { GapResponse, LanguageMetadataMap, RegionalDistribution } from "@atlasl2/shared";


function renderSelectableLabel(
  label: string,
  code: string | undefined,
  onSelect?: (id: string) => void,
) {
  if (!onSelect || !code) {
    return <>{label}</>;
  }

  return (
    <button
      type="button"
      className="inlineActionLabel"
      onClick={() => onSelect(code)}
    >
      {label}
    </button>
  );
}


function renderGapRecommendations(
  gapLoading: boolean,
  gap: GapResponse | null,
  languageMetadata: LanguageMetadataMap,
  onAddLanguage?: (languageID: string) => void,
) {
  return (
    <ul className="breakdownList text-left">
      {gapLoading && <li>Loading...</li>}
      {!gapLoading && (gap?.length ?? 0) === 0 && <li>No recommendations yet.</li>}
      {!gapLoading && (gap ?? []).map((item) => (
        <li key={item.lang}>
          {renderSelectableLabel(toLanguageDisplayName(item.lang, languageMetadata), item.lang, onAddLanguage)}: {formatGapRecommendation(item.marginalGain, item.estimatedPopulationGain)}
        </li>
      ))}
    </ul>
  );
}

function renderExploreLanguageBreakdown(
  exploreLoading: boolean,
  topLanguages: RegionalDistribution[],
  languageMetadata: LanguageMetadataMap,
  onAddLanguage?: (languageID: string) => void,
  className = "breakdownList",
) {
  return (
    <ul className={className}>
      {exploreLoading && <li>Loading...</li>}
      {!exploreLoading && topLanguages.length === 0 && <li>No language breakdown available.</li>}
      {!exploreLoading && topLanguages.map((entry) => (
        <li key={entry.lang}>
          {renderSelectableLabel(toLanguageDisplayName(entry.lang, languageMetadata), entry.lang, onAddLanguage)}: {formatCompactPopulation(entry.population)}
        </li>
      ))}
    </ul>
  );
}

export function CountriesOnlyStateView() {
  const {
    context, selectedCountries, selectedPopulation, primaryCountry, hasSingleCountry
  } = useInfoScope();
  const { languageMetadata, explore, loading, addLanguage } = context;

  const scriptDisplayNames = new Intl.DisplayNames(['en'], { type: 'script' });
  const englishLanguageDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const singleCountryOfficialLanguages = hasSingleCountry
    ? buildSingleCountryOfficialLanguages(primaryCountry, languageMetadata, englishLanguageDisplayNames)
    : [];
  const singleCountryPrimaryScripts = hasSingleCountry
    ? buildSingleCountryPrimaryScripts(primaryCountry, scriptDisplayNames)
    : [];

  return (
    <div className="infoState">
      {hasSingleCountry ? (
        <h2>{`${primaryCountry?.flag ?? ""} ${primaryCountry?.name ?? "No Country Selected"}`.trim()}</h2>
      ) : (
        <h3 className="text-center">{`Region Overview: ${selectedCountries.length} Countries`}</h3>
      )}

      {hasSingleCountry ? (
        <>
          <div className="statBlock">
            <h4>Region</h4>
            <div className="value metaValue">
              {loading.metadata ? "Loading..." : (primaryCountry?.region ?? "N/A")}
            </div>
          </div>

          <div className="statBlock">
            <h4>Total Population</h4>
            <div className="value">
              {loading.metadata
                ? "Loading..."
                : (primaryCountry ? primaryCountry.population.toLocaleString() : "N/A")
              }
            </div>
          </div>

          {(primaryCountry?.gdp.ppp !== null || primaryCountry?.gdp.per_capita_ppp !== null) && (
            <>
              <h4>GDP (PPP):</h4>
              <ul className="breakdownList">
                {primaryCountry?.gdp.ppp !== null && <li>{formatPPPBillions(primaryCountry?.gdp.ppp ?? null)}</li>}
                {primaryCountry?.gdp.per_capita_ppp !== null && (
                  <li>{formatPPPPerCapita(primaryCountry?.gdp.per_capita_ppp ?? null)} (Per Capita)</li>
                )}
              </ul>
            </>
          )}

          {singleCountryOfficialLanguages.length > 0 && (
            <>
              <h4>Official Languages:</h4>
              <ul className="breakdownList">
                {singleCountryOfficialLanguages.map((languageName) => (
                  <li key={languageName}>{languageName}</li>
                ))}
              </ul>
            </>
          )}

          {singleCountryPrimaryScripts.length > 0 && (
            <>
              <h4>Primary Scripts:</h4>
              <ul className="breakdownList">
                {singleCountryPrimaryScripts.map((scriptName) => (
                  <li key={scriptName}>{scriptName}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <div className="statBlock">
          <h4>Total Population</h4>
          <div className="value">
            {loading.metadata || loading.explore ? "Loading..." : formatCompactPopulation(selectedPopulation)}
          </div>
        </div>
      )}

      <h4>Top Languages</h4>
      {renderExploreLanguageBreakdown(
        loading.explore,
        explore?.topLanguages ?? [],
        languageMetadata,
        addLanguage,
      )}
    </div>
  );
}

export function LanguageViewState() {
  const {
    context, hasSingleCountry, selectedLanguagesCount, languageViewTitle,
    circleScorePct, regionalReachablePopulation, regionalUnreachablePopulation
  } = useInfoScope();
  const {
    countryMetadata, languageMetadata,
    reach, gap, explore, loading,
    addLanguage, addCountry,
  } = context;

  const reachableLoading = loading.reach || loading.explore;
  const unreachableLoading = loading.reach || loading.explore;

  return (
    <div className="infoState text-center">
      <h3>{languageViewTitle}</h3>

      <div className="scoreDonut" style={{ '--score-pct': `${circleScorePct ?? 0}%` } as React.CSSProperties}>
        <div className="scoreDonutInner">
          {loading.reach ? "..." : (circleScorePct !== null ? circleScorePct : "N/A")}
        </div>
      </div>
      <div className="metricLabel">Communicability Index</div>

      {!hasSingleCountry && (
        <>
          <h4 className="text-left mt-4">Top Contributing Regions</h4>
          <div className="barChartPlaceholder">
            {(reach?.topContributingRegions ?? []).length === 0 && <div className="barRow">No data yet.</div>}
            {(reach?.topContributingRegions ?? []).map((entry) => (
              <div className="barRow" key={entry.countryID}>
                <span className="barLabel">
                  {renderSelectableLabel(
                    toCountryDisplayName(entry.countryID, countryMetadata),
                    entry.countryID,
                    addCountry
                  )}
                </span>
                <div className="barTrack">
                  <div
                    className="barFill"
                    style={{ width: `${Math.min(100, entry.score * 92 + 8)}%` }}
                  ></div>
                </div>
                <span className="barValue">{formatCompactPopulation(entry.estimatedSpeakers)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <details
        className={`expandableSection text-left mt-4${selectedLanguagesCount <= 1 ? " nonExpandable" : ""}`}
        open={selectedLanguagesCount <= 1}
      >
        <summary onClick={selectedLanguagesCount <= 1 ? (event) => event.preventDefault() : undefined}>
          <span className="expandableLabel">Reachable Population:</span>{' '}
          <span className="expandableValue">
            {reachableLoading ? "Loading..." : formatCompactPopulation(regionalReachablePopulation)}
          </span>
        </summary>
        {selectedLanguagesCount > 1 && renderExploreLanguageBreakdown(
          loading.explore,
          explore?.topLanguages ?? [],
          languageMetadata,
          addLanguage,
          "breakdownList text-left",
        )}
      </details>

      <details className="expandableSection text-left mt-4" open>
        <summary>
          <span className="expandableLabel">Unreachable Population:</span>{' '}
          <span className="expandableValue">
            {unreachableLoading ? "Loading..." : formatCompactPopulation(regionalUnreachablePopulation)}
          </span>
        </summary>
        {renderGapRecommendations(loading.gap, gap, languageMetadata, addLanguage)}
      </details>
    </div>
  );
}
