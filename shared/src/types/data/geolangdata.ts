// JSON Dataset for Country->Language and Language->Country mapping
export interface CombinedData {
  metadata: {
    generatedAt: string;
    sourceHash: string;
  };
  languages: CombinedLanguageData<true>;
  countries: CombinedCountryData;
}

// Combined Language Data, for source referencing

export type MatrixMap<
  OuterCode extends string,
  InnerCode extends string,
  isCompiledData extends boolean,
> = {
  [Outer in OuterCode]: {
    [Inner in InnerCode]: isCompiledData extends true ? number : CountryLanguageData;
  };
};

export type CombinedLanguageData<
  isCompiledData extends boolean = false,
  LangISO3Codes extends string = string,
  CountryISO3Codes extends string = string,
> = MatrixMap<LangISO3Codes, CountryISO3Codes, isCompiledData>;

export type CombinedCountryData<
  CountryISO3Codes extends string = string,
  LangISO3Codes extends string = string,
> = MatrixMap<CountryISO3Codes, LangISO3Codes, true>;

export interface CountryLanguageData extends BaseSourceData {
  ethnologue: EthnologueSourceData;
  unicode: BaseSourceData;
  patch?: PatchData;
}

export interface EthnologueSourceData extends BaseSourceData {
  L1: number;
  L2: number;
}

export interface PatchData extends BaseSourceData, Partial<FlaggedData> {}

export interface FlaggedData {
  /** Nonsensical data flagged by AI for manual review */
  flag_reason: string;
  /** Reason/sources for manual resolution */
  resolve_reason: string;
}

export interface BaseSourceData {
  total: number;
}


// Raw output from LLM, unsanitised

export interface RawLanguageFile {
  language_code: string;
  countries: Record<string, RawLanguageCountryData>;
}

export interface RawLanguageCountryData extends EthnologueSourceData {
  flag_for_review: boolean;
  flag_reason: string | null;
}

export interface UnicodeCountryData {
  lang_code: string;
  pop: number;
}

export type UnicodeData = Record<string, Partial<UnicodeCountryData>[]>;
