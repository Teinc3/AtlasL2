import { useState } from "react";

import "./searchdropdown.css";

import type { SearchDropdownProps } from "../../types";


export default function SearchDropdown(props: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const handleSelect = (id: string) => {
    props.onSelect(id);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (props.options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      setIsOpen(true);
      setHighlightedIndex(index => index === props.options.length - 1 ? 0 : index + 1);
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowUp") {
      setIsOpen(true);
      setHighlightedIndex(index => index === 0 ? props.options.length - 1 : index - 1);
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      const option = props.options[highlightedIndex] ?? props.options[0];
      if (option) {
        handleSelect(option.id);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Tab") {
      if (!isOpen) {
        return;
      }
      setHighlightedIndex(index => index === props.options.length - 1 ? 0 : index + 1);
      event.preventDefault();
    }
  };

  return (
    <div className="searchDropdown">
      <input
        type="text"
        value={props.value}
        placeholder={props.placeholder}
        onChange={(event) => {
          const nextQuery = event.target.value;
          props.onQueryChange(nextQuery);
          setIsOpen(nextQuery.trim().length > 0);
          setHighlightedIndex(-1);
        }}
        onFocus={() => {
          if (props.value.trim().length > 0 && props.options.length > 0) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (
        <div className="searchDropdownMenu" role="listbox">
          {props.options.length === 0 ? (
            <div className="searchDropdownEmpty">No matches</div>
          ) : (
            props.options.map((option, index) => (
              <button
                type="button"
                key={option.id}
                className={`searchDropdownItem ${index === highlightedIndex ? "active" : ""}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(option.id);
                }}
              >
                <span className="searchDropdownPrimary">{option.leftLabel}</span>
                <span className="searchDropdownSecondary">{option.rightLabel}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
