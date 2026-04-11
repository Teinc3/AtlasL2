import type {
  CombinedData, CountryMetadataMap, LanguageMetadataMap, LanguageRelationMap
} from '@atlasl2/shared';


export interface AppData {
  countryMetadata: CountryMetadataMap;
  languageMetadata: LanguageMetadataMap;
  combinedData: CombinedData;
  relationMap: LanguageRelationMap;
}
