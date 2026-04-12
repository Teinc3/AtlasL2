export type AutocompleteOption = {
	id: string;
	leftLabel: string;
	rightLabel: string;
};

export type SearchOption = {
  id: string;
  leftLabel: string;
  rightLabel: string;
};

export type SearchDropdownProps = {
  value: string;
  placeholder: string;
  options: SearchOption[];
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
};
