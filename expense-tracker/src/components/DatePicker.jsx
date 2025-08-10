import React, { useState, useRef, useEffect } from "react";
import "../css/DatePicker.css";

const DatePicker = ({ selectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearSelection, setShowYearSelection] = useState(false);
  const [popupPosition, setPopupPosition] = useState('popup-below');
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const calendarRef = useRef(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 425);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Parse the selected date or use today's date
  const parsedSelectedDate = selectedDate ? new Date(selectedDate) : new Date();

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return as-is if invalid
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse dd/mm/yyyy format to yyyy-mm-dd
  const parseDateFromInput = (inputStr) => {
    if (!inputStr) return '';
    
    const parts = inputStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
        const date = new Date(year, month - 1, day);
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          return date.toISOString().split("T")[0];
        }
      }
    }
    return null;
  };

  // Update input value when selectedDate changes
  useEffect(() => {
    if (isMobile) {
      setInputValue(formatDateForDisplay(selectedDate));
    }
  }, [selectedDate, isMobile]);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setShowYearSelection(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate optimal popup position
  const calculatePopupPosition = () => {
    if (!calendarRef.current) return 'popup-below';
    
    const rect = calendarRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 350; // Approximate popup height
    const popupWidth = 280;
    
    let position = 'popup-below';
    
    // Check if popup fits below
    if (rect.bottom + popupHeight > viewportHeight) {
      // Check if popup fits above
      if (rect.top - popupHeight > 0) {
        position = 'popup-above';
      } else {
        position = 'popup-below'; // Keep below but it will be scrollable
      }
    }
    
    // Check horizontal positioning
    if (rect.left + popupWidth > viewportWidth) {
      if (rect.right - popupWidth > 0) {
        position += ' popup-right';
      } else {
        position += ' popup-center';
      }
    }
    
    return position;
  };

  const handleInputClick = () => {
    if (!isMobile) {
      setPopupPosition(calculatePopupPosition());
      setShowCalendar(!showCalendar);
    }
  };

  // Handle manual input for mobile
  const handleInputChange = (e) => {
    if (isMobile) {
      const value = e.target.value;
      setInputValue(value);
      
      // Try to parse and update the date
      const parsedDate = parseDateFromInput(value);
      if (parsedDate) {
        onDateChange(parsedDate);
      }
    }
  };

  const handleInputBlur = () => {
    if (isMobile) {
      // Validate and format the input on blur
      const parsedDate = parseDateFromInput(inputValue);
      if (parsedDate) {
        setInputValue(formatDateForDisplay(parsedDate));
      } else if (inputValue.trim() === '') {
        // Clear if empty
        onDateChange('');
        setInputValue('');
      } else {
        // Reset to previous valid value if invalid
        setInputValue(formatDateForDisplay(selectedDate));
      }
    }
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    const selected = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateChange(selected.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    onDateChange(today.toISOString().split("T")[0]);
    setCurrentMonth(today);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleMonthYearClick = () => {
    setShowYearSelection(!showYearSelection);
  };

  const handleYearSelect = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearSelection(false);
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = firstDayOfMonth(month, year);
    const totalDays = daysInMonth(month, year);
    const today = new Date();

    const days = [];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Add day names header
    dayNames.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="dp-day-name">
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div className="dp-day empty" key={`empty-${i}`} />);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected =
        selectedDate === currentDate.toISOString().split("T")[0];
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push(
        <div
          key={day}
          className={`dp-day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          }`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const renderYearSelection = () => {
    const currentYear = currentMonth.getFullYear();
    const years = [];
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(
        <div
          key={year}
          className={`dp-year ${year === currentYear ? "selected" : ""}`}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </div>
      );
    }

    return (
      <div className="dp-year-selection">
        <div className="dp-year-grid">{years}</div>
        <button type="button" className="dp-today-btn" onClick={handleTodayClick}>
          Today
        </button>
      </div>
    );
  };

  return (
    <div className="datepicker-container" ref={calendarRef}>
      <input
        type="text"
        className={`expense-input ${isMobile ? 'mobile-date-input' : ''}`}
        readOnly={!isMobile}
        value={isMobile ? inputValue : (selectedDate || "")}
        onClick={handleInputClick}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={isMobile ? "dd/mm/yyyy" : "Select date"}
      />
      {showCalendar && !isMobile && (
        <div className={`datepicker-popup ${popupPosition}`}>
          <div className="datepicker-header">
            <button type="button" className="dp-nav-btn" onClick={handlePrevMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="dp-month-year" onClick={handleMonthYearClick}>
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {currentMonth.getFullYear()}
            </div>
            
            <button type="button" className="dp-nav-btn" onClick={handleNextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {showYearSelection ? (
            renderYearSelection()
          ) : (
            <>
              <div className="datepicker-grid">{renderDays()}</div>
              <div className="datepicker-footer">
                <button type="button" className="dp-today-btn" onClick={handleTodayClick}>
                  Today
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;