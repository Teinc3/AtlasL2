import { readFile } from 'fs/promises';
import path from 'path';
import fastifyPlugin from 'fastify-plugin';

import type {
  CombinedData, CountryMetadataMap, LanguageMetadataMap, LanguageRelationMap
} from '@atlasl2/shared';


const repoRoot = path.resolve(process.cwd(), '..');
const countryMetadataPath = path.join(repoRoot, 'data/country_metadata.json');
const languageMetadataPath = path.join(repoRoot, 'data/language_metadata.json');
const combinedDataPath = path.join(repoRoot, 'data/combined_data.json');
const relationMapPath = path.join(repoRoot, 'data/relation_map.json');


export default fastifyPlugin(async (instance) => {
  const [
    countryMetadataRaw, languageMetadataRaw, combinedDataRaw, relationMapRaw
  ] = await Promise.all([
    readFile(countryMetadataPath, 'utf8'),
    readFile(languageMetadataPath, 'utf8'),
    readFile(combinedDataPath, 'utf8'),
    readFile(relationMapPath, 'utf8'),
  ]);

  const countryMetadata: CountryMetadataMap = JSON.parse(countryMetadataRaw);
  const languageMetadata: LanguageMetadataMap = JSON.parse(languageMetadataRaw);
  const combinedData: CombinedData = JSON.parse(combinedDataRaw);
  const relationMap: LanguageRelationMap = JSON.parse(relationMapRaw);

  instance.decorate('dataStore', Object.freeze({
    countryMetadata,
    languageMetadata,
    combinedData,
    relationMap,
  }));
});
