export interface HoverPanelProps {
  x: number;
  y: number;
  countryName: string;
  population: number;
  continent: string;
  isVisible: boolean;
  isInRegion: boolean;
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
