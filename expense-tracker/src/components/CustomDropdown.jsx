import React, { useState, useRef, useEffect } from 'react';
import "../css/CustomDropdown.css";
import { FaChevronDown } from "react-icons/fa";

const CustomDropdown = ({ options, label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onChange(name, option);
    setIsOpen(false);
  };

  // Detect whether to open up or down
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = Math.min(200, options.length * 40); // Approximate list height
      setOpenUp(spaceBelow < estimatedHeight);
    }
  }, [isOpen, options.length]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`custom-dropdown ${openUp ? "open-up" : ""}`}
      ref={dropdownRef}
    >
      <div
        className={`dropdown-header ${isOpen ? "open" : ""} ${
          !value ? "placeholder" : ""
        }`}
        onClick={toggleDropdown}
      >
        <span className="dropdown-text">{value || label}</span>
        <FaChevronDown className={`dropdown-icon ${isOpen ? "rotated" : ""}`} />
      </div>
      {isOpen && (
        <ul className="dropdown-list" ref={listRef}>
          {options.map((option, idx) => (
            <li
              key={idx}
              className={`dropdown-option ${
                value === option ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
