// src/components/CustomDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import "../css/CustomDropdown.css";
import { FaChevronDown } from "react-icons/fa";

const CustomDropdown = ({ options, label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    onChange(name, option);
    setIsOpen(false);
  };

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
    <div className="custom-dropdown" ref={dropdownRef}>
      <div 
        className={`dropdown-header ${isOpen ? 'open' : ''} ${!value ? 'placeholder' : ''}`} 
        onClick={toggleDropdown}
      >
        <span className="dropdown-text">
          {value || label}
        </span>
        <FaChevronDown className={`dropdown-icon ${isOpen ? 'rotated' : ''}`} />
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option, idx) => (
            <li
              key={idx}
              className={`dropdown-option ${value === option ? 'selected' : ''}`}
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