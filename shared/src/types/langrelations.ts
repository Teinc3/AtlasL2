export type LanguageRelationMap = Record<string, Record<string, number>>;


// Raw Relation configuration

export type LanguageRelationConfig = LanguageRelation[];

export type LanguageRelation = AsymmetricEdge | TransitiveHub | NonTransitiveHub;

/** All languages here form a cartesian product of connectivities with each other */
export interface TransitiveHub extends BaseScore {
  languages: string[];
}

/** All parents here form cartesian products of connectivities with children */
export interface NonTransitiveHub extends BaseScore {
  parent: string[];
  children: string[];
}

export interface BaseScore {
  score: number;
}

export interface AsymmetricEdge {
  parent: string;
  child: string;
  /** Downstream connectivity (parent understanding of child, Receptive reach) */
  downstream: number;
  /** Upstream connectivity (child understanding of parent, Broadcast power) */
  upstream: number;
}
