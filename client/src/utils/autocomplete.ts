import type { CountryMetadataMap, LanguageMetadataMap } from '@atlasl2/shared';
import type { AutocompleteOption } from '../types';


/** Filters and sorts autocomplete options based on search query */
function filterAndSortOptions(
  options: AutocompleteOption[],
  query: string
): AutocompleteOption[] {
	const trimmedQuery = query.trim().toLowerCase();
	if (!trimmedQuery) {
		return [];
	}

	return options
		.filter(({ leftLabel, rightLabel }) => {
			const left = leftLabel.toLowerCase();
			const right = rightLabel.toLowerCase();
			return left.includes(trimmedQuery) || right.includes(trimmedQuery);
		})
		.sort((optionA, optionB) => {
			const aLeft = optionA.leftLabel.toLowerCase();
			const bLeft = optionB.leftLabel.toLowerCase();
			const aPrefix = aLeft.startsWith(trimmedQuery) ? 0 : 1;
			const bPrefix = bLeft.startsWith(trimmedQuery) ? 0 : 1;

			if (aPrefix !== bPrefix) {
				return aPrefix - bPrefix;
			}
			return optionA.leftLabel.localeCompare(optionB.leftLabel);
		});
}


export function getLanguageAutocompleteOptions(
	languageMetadata: LanguageMetadataMap,
	selectedLanguageIDs: string[],
	query: string
): AutocompleteOption[] {
	const selectedSet = new Set(selectedLanguageIDs);
	const options = Object.values(languageMetadata)
		.filter((language) => !selectedSet.has(language.id))
		.map((language) => ({
			id: language.id,
			leftLabel: language.displayName,
			rightLabel: language.cluster ?? language.family,
		}));

	return filterAndSortOptions(options, query);
}


export function getCountryAutocompleteOptions(
	countryMetadata: CountryMetadataMap,
	selectedCountryIDs: string[],
	query: string
): AutocompleteOption[] {
	const selectedSet = new Set(selectedCountryIDs);
	const options = Object.values(countryMetadata)
		.filter((country) => !selectedSet.has(country.id))
		.map((country) => ({
			id: country.id,
			leftLabel: country.name,
			rightLabel: country.region,
		}));

	return filterAndSortOptions(options, query);
}


export function createLanguageDisplayNameToIDMap(languageMetadata: LanguageMetadataMap): Map<string, string> {
	return new Map(Object.values(languageMetadata).map(
		(language) => [language.displayName, language.id]
	));
}

export function createCountryDisplayNameToIDMap(countryMetadata: CountryMetadataMap): Map<string, string> {
	return new Map(Object.values(countryMetadata).map(
		(country) => [country.name, country.id]
	));
}

export function toCountryDisplayName(countryID: string, countryMetadata: CountryMetadataMap): string {
	return countryMetadata[countryID]?.name ?? 'Country ' + countryID;
}

export function toLanguageDisplayName(languageID: string, languageMetadata: LanguageMetadataMap): string {
	return languageMetadata[languageID]?.displayName ?? 'Language ' + languageID;
}
