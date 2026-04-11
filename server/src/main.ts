import { buildApp } from './app';


const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

try {
	await app.listen({ port, host });
	app.log.info({
		countries: Object.keys(app.dataStore.countryMetadata).length,
		languages: Object.keys(app.dataStore.languageMetadata).length,
		combinedLanguages: Object.keys(app.dataStore.combinedData.languages).length,
		relationRoots: Object.keys(app.dataStore.relationMap).length,
	}, 'Data store loaded');
} catch (error) {
	app.log.error(error);
	process.exit(1);
}
