import { toCountryDisplayName, toLanguageDisplayName } from "../../../utils";
import { formatGapRecommendation, formatPPPBillions, formatPPPPerCapita } from "../../../utils";

import type { CountriesOnlyStateViewProps, LanguageViewStateProps } from "../../../types";


function renderGapRecommendations(
  gapLoading: boolean,
  gap: LanguageViewStateProps["gap"],
  languageMetadata: LanguageViewStateProps["languageMetadata"],
) {
  return (
    <ul className="breakdownList text-left">
      {gapLoading && <li>Loading...</li>}
      {!gapLoading && (gap?.length ?? 0) === 0 && <li>No recommendations yet.</li>}
      {!gapLoading && (gap ?? []).map((item) => (
        <li key={item.lang}>
          {toLanguageDisplayName(item.lang, languageMetadata)}: {formatGapRecommendation(item.marginalGain, item.estimatedPopulationGain)}
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
            {toLanguageDisplayName(entry.lang, props.languageMetadata)}: {Math.round(entry.prevalence * 100)}%
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
            <li>Reachable: ~{props.regionalReachablePopulation.toLocaleString()}</li>
            <li>Unreachable: ~{props.regionalUnreachablePopulation.toLocaleString()}</li>
          </ul>
          <h4 className="text-left mt-4">Incremental Reach</h4>
          {renderGapRecommendations(props.gapLoading, props.gap, props.languageMetadata)}
        </>
      ) : (
        <>
          <h4 className="text-left mt-4">Top Contributing Regions</h4>
          <div className="barChartPlaceholder">
            {props.topContributors.length === 0 && <div className="barRow">No data yet.</div>}
            {props.topContributors.map((entry) => (
              <div className="barRow" key={entry.countryID}>
                <span className="barLabel">{toCountryDisplayName(entry.countryID, props.countryMetadata)}</span>
                <div className="barTrack">
                  <div
                    className="barFill"
                    style={{ width: `${Math.min(100, entry.score * 95 + 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {props.hasCountries && (
            <>
              <h4 className="text-left mt-4">Incremental Reach</h4>
              {renderGapRecommendations(props.gapLoading, props.gap, props.languageMetadata)}
            </>
          )}
        </>
      )}
    </div>
  );
}
