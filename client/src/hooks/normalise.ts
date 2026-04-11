import type { CountryMetadataMap, LanguageMetadataMap } from '@atlasl2/shared';


export function resolveLanguageIds(
	selectedLanguages: string[],
	languageMetadata: LanguageMetadataMap
): string[] {
	const displayNameToId = new Map(Object.values(languageMetadata).map(
    language => [language.displayName, language.id]
  ));

	return selectedLanguages
		.map((languageName) => displayNameToId.get(languageName))
		.filter((languageId): languageId is string => Boolean(languageId));
}

export function resolveCountryIds(
	selectedCountries: string[],
	countryMetadata: CountryMetadataMap
): string[] {
	const countryNameToId = new Map(Object.values(countryMetadata).map((country) => [country.name, country.id]));

	return selectedCountries
		.map((countryName) => countryNameToId.get(countryName))
		.filter((countryId): countryId is string => Boolean(countryId));
}
