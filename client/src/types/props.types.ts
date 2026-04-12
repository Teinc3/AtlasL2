import type { CSSProperties } from "react";
import type { 
  CountryMetadata, CountryMetadataMap, GapResponse, LanguageMetadataMap
} from "@atlasl2/shared";


export interface HoverPanelProps {
  x: number;
  y: number;
  countryName: string;
  population: number;
  continent: string;
  flag?: string;
  isVisible: boolean;
  /* This is optional bcz there may not be any selected langs */
  communicabilityIndex?: number;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export interface HoverState {
  isVisible: boolean;
  x: number;
  y: number;
  countryId: string | null;
  /* Tracks if the user has hovered enough to lock the panel */
  isLocked: boolean;
}

export interface BasePanelProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export type CountriesOnlyStateViewProps = {
  hasSingleCountry: boolean;
  primaryCountry: CountryMetadata | null;
  selectedCountriesCount: number;
  metadataLoading: boolean;
  totalSelectedPopulation: number;
  singleCountryOfficialLanguages: string[];
  singleCountryPrimaryScripts: string[];
  countriesOnlyTopFive: {
    lang: string;
    prevalence: number;
  }[];
  exploreLoading: boolean;
  languageMetadata: LanguageMetadataMap;
};

export type LanguageViewStateProps = {
  languageViewTitle: string;
  scoreDonutStyle: CSSProperties;
  reachLoading: boolean;
  circleScorePct: number | null;
  hasSingleCountry: boolean;
  regionalReachablePopulation: number;
  regionalUnreachablePopulation: number;
  gapLoading: boolean;
  gap: GapResponse | null;
  languageMetadata: LanguageMetadataMap;
  scopePopulation: number;
  topContributors: [string, number][];
  countryMetadata: CountryMetadataMap;
  hasCountries: boolean;
};
