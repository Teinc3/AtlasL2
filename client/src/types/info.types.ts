import type { GapResponse } from "@atlasl2/shared";


export type TopLanguageEntry = {
	lang: string;
	prevalence: number;
};

export type GapList = GapResponse | null;
