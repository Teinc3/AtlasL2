import { Static, Type } from '@sinclair/typebox';


const ISO3CodeSchema = Type.String({ pattern: '^[A-Z]{3}$' });
const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);

export const GDPMetadataSchema = Type.Object({
  nominal: NullableNumberSchema,
  ppp: NullableNumberSchema,
  per_capita_nominal: NullableNumberSchema,
  per_capita_ppp: NullableNumberSchema,
});

export const CountryOfficialScriptSchema = Type.Object({
  iso3: Type.String({ pattern: '^[a-z]{3}$' }),
  primary_script: Type.Union([Type.String(), Type.Null()]),
});

export const CountryMetadataSchema = Type.Object({
  id: ISO3CodeSchema,
  name: Type.String(),
  flag: Type.String(),
  region: Type.String(),
  population: Type.Number({ minimum: 0 }),
  gdp: GDPMetadataSchema,
  official_scripts: Type.Array(CountryOfficialScriptSchema),
});

export const CountryMetadataMapSchema = Type.Record(ISO3CodeSchema, CountryMetadataSchema);

export const WorldBankCountryRowSchema = Type.Object({
  id: ISO3CodeSchema,
  countryName: Type.String(),
  population: Type.Number({ minimum: 0 }),
  gdp: GDPMetadataSchema,
});

export const LanguageBaseMetadataSchema = Type.Object({
  id: ISO3CodeSchema,
  displayName: Type.String(),
  family: Type.String(),
  cluster: Type.Optional(Type.String()),
});

export const LanguageMetadataSchema = Type.Composite([
  LanguageBaseMetadataSchema,
  Type.Object({
    globalSpeakers: Type.Number({ minimum: 0 }),
  }),
]);

export const LanguageBaseMetadataMapSchema = Type.Record(ISO3CodeSchema, LanguageBaseMetadataSchema);
export const LanguageMetadataMapSchema = Type.Record(ISO3CodeSchema, LanguageMetadataSchema);

export type GDPMetadataFromSchema = Static<typeof GDPMetadataSchema>;
export type CountryOfficialScriptFromSchema = Static<typeof CountryOfficialScriptSchema>;
export type CountryMetadataFromSchema = Static<typeof CountryMetadataSchema>;
export type CountryMetadataMapFromSchema = Static<typeof CountryMetadataMapSchema>;
export type WorldBankCountryRowFromSchema = Static<typeof WorldBankCountryRowSchema>;
export type LanguageBaseMetadataFromSchema = Static<typeof LanguageBaseMetadataSchema>;
export type LanguageMetadataFromSchema = Static<typeof LanguageMetadataSchema>;
export type LanguageBaseMetadataMapFromSchema = Static<typeof LanguageBaseMetadataMapSchema>;
export type LanguageMetadataMapFromSchema = Static<typeof LanguageMetadataMapSchema>;
