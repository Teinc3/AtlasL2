import { useAtlasContext } from '../context';
import { computeLanguageViewTitle } from '../utils';


export default function useInfoScope() {
	const context = useAtlasContext();
	const {
		selectedCountries, selectedLanguages, focusedCountryId,
		countryMetadata, languageMetadata,
		reach, explore,
	} = context;

	const hasCountries = selectedCountries.length > 0;
	const hasSingleCountry = selectedCountries.length === 1;

	const primaryCountryID = focusedCountryId ?? selectedCountries[0] ?? null;
	const primaryCountry = primaryCountryID ? countryMetadata[primaryCountryID] : null;

	const selectedLanguagesCount = selectedLanguages.length;
	const selectedPopulation = explore?.selectedPopulation ?? 0;
	const primaryCountryReach = primaryCountryID ? reach?.breakdown[primaryCountryID] : undefined;

	const circleScore = hasSingleCountry ? primaryCountryReach?.score : reach?.globalIndex;
	const circleScorePct = circleScore !== undefined ? Math.round(circleScore * 100) : null;

	const regionalReachablePopulation = circleScore !== undefined ? Math.round(selectedPopulation * circleScore) : 0;
	const regionalUnreachablePopulation = Math.max(0, selectedPopulation - regionalReachablePopulation);

	const languageViewTitle = computeLanguageViewTitle(
		selectedLanguages,
		languageMetadata,
		hasCountries,
		hasSingleCountry,
		primaryCountry,
		selectedCountries,
		countryMetadata
	);

	return {
		context, circleScorePct, languageViewTitle,
		selectedCountries, hasSingleCountry, primaryCountry,
		selectedLanguagesCount, selectedPopulation,
		regionalReachablePopulation, regionalUnreachablePopulation
	};
}
