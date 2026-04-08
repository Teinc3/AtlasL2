export type CombinedLanguageData<LangISO3Codes extends string = string> = {
  [LangISO3Code in LangISO3Codes]: LanguageData<LangISO3Code>;
}

export interface LanguageData<LangISO3Code extends string = string> {
  language: LangISO3Code;
  countries: Record<string, CountryLanguageData>;
}

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
