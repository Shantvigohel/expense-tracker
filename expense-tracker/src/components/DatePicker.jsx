import React, { useState, useRef, useEffect } from "react";
import "../css/DatePicker.css";

const DatePicker = ({ selectedDate, onDateChange, className = "" }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearSelection, setShowYearSelection] = useState(false);
  const calendarRef = useRef(null);

  // Parse the selected date or use today's date
  const parsedSelectedDate = selectedDate ? new Date(selectedDate) : new Date();

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
        <button className="dp-today-btn" onClick={handleTodayClick}>
          Today
        </button>
      </div>
    );
  };

  return (
    <div className="datepicker-container" ref={calendarRef}>
      <input
        type="text"
        className={`expense-input ${className}`}
        readOnly
        value={selectedDate || ""}
        onClick={() => setShowCalendar(!showCalendar)}
        placeholder="Select date"
      />
      {showCalendar && (
        <div className="datepicker-popup">
          <div className="datepicker-header">
            <button className="dp-nav-btn" onClick={handlePrevMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="dp-month-year" onClick={handleMonthYearClick}>
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {currentMonth.getFullYear()}
            </div>
            
            <button className="dp-nav-btn" onClick={handleNextMonth}>
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
                <button className="dp-today-btn" onClick={handleTodayClick}>
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