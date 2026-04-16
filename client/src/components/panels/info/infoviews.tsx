import { toCountryDisplayName, toLanguageDisplayName } from "../../../utils";
import { 
  formatCompactPopulation, formatGapRecommendation, formatPPPBillions, formatPPPPerCapita
} from "../../../utils";

import type { CountriesOnlyStateViewProps, LanguageViewStateProps } from "../../../types";


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
  gap: LanguageViewStateProps["gap"],
  languageMetadata: LanguageViewStateProps["languageMetadata"],
  onAddLanguage?: LanguageViewStateProps["onAddLanguage"],
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

export function CountriesOnlyStateView(props: CountriesOnlyStateViewProps) {
  return (
    <div className="infoState">
      {props.hasSingleCountry ? (
        <h2>{`${props.primaryCountry?.flag ?? ""} ${props.primaryCountry?.name ?? "No Country Selected"}`.trim()}</h2>
      ) : (
        <h3 className="text-center">{`Region Overview: ${props.selectedCountriesCount} Countries`}</h3>
      )}

      {props.hasSingleCountry ? (
        <>
          <div className="statBlock">
            <h4>Region</h4>
            <div className="value metaValue">
              {props.metadataLoading ? "Loading..." : (props.primaryCountry?.region ?? "N/A")}
            </div>
          </div>

          <div className="statBlock">
            <h4>Total Population</h4>
            <div className="value">
              {props.metadataLoading
                ? "Loading..."
                : (props.primaryCountry ? props.primaryCountry.population.toLocaleString() : "N/A")
              }
            </div>
          </div>

          {(props.primaryCountry?.gdp.ppp !== null || props.primaryCountry?.gdp.per_capita_ppp !== null) && (
            <>
              <h4>GDP (PPP):</h4>
              <ul className="breakdownList">
                {props.primaryCountry?.gdp.ppp !== null && <li>{formatPPPBillions(props.primaryCountry?.gdp.ppp ?? null)}</li>}
                {props.primaryCountry?.gdp.per_capita_ppp !== null && (
                  <li>{formatPPPPerCapita(props.primaryCountry?.gdp.per_capita_ppp ?? null)} (Per Capita)</li>
                )}
              </ul>
            </>
          )}

          {props.singleCountryOfficialLanguages.length > 0 && (
            <>
              <h4>Official Languages:</h4>
              <ul className="breakdownList">
                {props.singleCountryOfficialLanguages.map((languageName) => (
                  <li key={languageName}>{languageName}</li>
                ))}
              </ul>
            </>
          )}

          {props.singleCountryPrimaryScripts.length > 0 && (
            <>
              <h4>Primary Scripts:</h4>
              <ul className="breakdownList">
                {props.singleCountryPrimaryScripts.map((scriptName) => (
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
            {props.metadataLoading || props.exploreLoading ? "Loading..." : props.selectedPopulation.toLocaleString()}
          </div>
        </div>
      )}

      <h4>Top Languages</h4>
      <ul className="breakdownList">
        {props.exploreLoading && <li>Loading...</li>}
        {!props.exploreLoading && props.topLanguages.length === 0 && (
          <li>No language breakdown available.</li>
        )}
        {!props.exploreLoading && props.topLanguages.map((entry) => (
          <li key={entry.lang}>
            {renderSelectableLabel(toLanguageDisplayName(entry.lang, props.languageMetadata), entry.lang, props.onAddLanguage)}: {Math.round(entry.prevalence * 100)}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LanguageViewState(props: LanguageViewStateProps) {
  return (
    <div className="infoState text-center">
      <h3>{props.languageViewTitle}</h3>

      <div className="scoreDonut" style={props.scoreDonutStyle}>
        <div className="scoreDonutInner">
          {props.reachLoading ? "..." : (props.circleScorePct !== null ? props.circleScorePct : "N/A")}
        </div>
      </div>
      <div className="metricLabel">Communicability Index</div>

      {props.hasSingleCountry ? (
        <>
          <ul className="breakdownList text-left mt-4">
            <li>Reachable: {formatCompactPopulation(props.regionalReachablePopulation)}</li>
            <li>Unreachable: {formatCompactPopulation(props.regionalUnreachablePopulation)}</li>
          </ul>
          <h4 className="text-left mt-4">Incremental Reach</h4>
          {renderGapRecommendations(props.gapLoading, props.gap, props.languageMetadata, props.onAddLanguage)}
        </>
      ) : (
        <>
          <h4 className="text-left mt-4">Top Contributing Regions</h4>
          <div className="barChartPlaceholder">
            {props.topContributors.length === 0 && <div className="barRow">No data yet.</div>}
            {props.topContributors.map((entry) => (
              <div className="barRow" key={entry.countryID}>
                <span className="barLabel">
                  {renderSelectableLabel(
                    toCountryDisplayName(entry.countryID, props.countryMetadata),
                    entry.countryID,
                    props.onAddCountry
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
          {props.hasCountries && (
            <>
              <h4 className="text-left mt-4">Incremental Reach</h4>
              {renderGapRecommendations(props.gapLoading, props.gap, props.languageMetadata, props.onAddLanguage)}
            </>
          )}
        </>
      )}
    </div>
  );
}
