import type { CountryMetadataMap, LanguageMetadataMap } from '@atlasl2/shared';


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
