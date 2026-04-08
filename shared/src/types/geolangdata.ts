type CombinedLanguageData<LangISO3Codes extends string = string> = {
  [LangISO3Code in LangISO3Codes]: LanguageData<LangISO3Code>;
}

interface LanguageData<LangISO3Code extends string = string> {
  language: LangISO3Code;
  countries: Record<string, CountryLanguageData>;
}

interface CountryLanguageData extends BaseSourceData {
  ethnologue: EthnologueSourceData;
  unicode: BaseSourceData;
  patch?: PatchData;
}

interface EthnologueSourceData extends BaseSourceData {
  L1: number;
  L2: number;
}

interface PatchData extends BaseSourceData, Partial<FlaggedData> {}

interface FlaggedData {
  /** Nonsensical data flagged by AI for manual review */
  flag_reason: string;
  flag_unresolved: boolean;
  /** Reason/sources for manual resolution */
  resolve_reason: string;
}

interface BaseSourceData {
  total: number;
}
