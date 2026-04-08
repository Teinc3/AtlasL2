type LanguageRelationConfig = LanguageRelation[];

type LanguageRelation = AsymmetricEdge | TransitiveHub | NonTransitiveHub;

/** All languages here form a cartesian product of connectivities with each other */
interface TransitiveHub extends BaseScore {
  languages: string[];
}

/** All parents here form cartesian products of connectivities with children */
interface NonTransitiveHub extends BaseScore {
  parent: string[];
  children: string[];
}

interface BaseScore {
  score: number;
}

interface AsymmetricEdge {
  parent: string;
  child: string;
  /** Downstream connectivity (parent understanding of child, Receptive reach) */
  downstream: number;
  /** Upstream connectivity (child understanding of parent, Broadcast power) */
  upstream: number;
}
