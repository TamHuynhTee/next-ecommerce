"use client";
import React, { useState, useEffect, useRef } from "react";

type Option = { label: string; value: string };

const CustomSelect = ({
  options,
  value,
  onChange,
}: {
  options: Option[];
  /** Currently selected option value; defaults to the first option. */
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  // Close the dropdown when a click occurs outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleOptionClick = (option: Option) => {
    setIsOpen(false);
    if (option.value !== selectedOption.value) onChange?.(option.value);
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options
          .filter((option) => option.value !== selectedOption.value)
          .map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="select-item"
            >
              {option.label}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CustomSelect;
