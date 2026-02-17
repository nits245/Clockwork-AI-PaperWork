import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./Calendar.scss";
import { generateDate, months } from "./Date";
import cn from "./cn";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import smileFace from "../../img/calendar/smile-face.svg";

// Calendar Component
const Calendar: React.FC = () => {
  const days: string[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const currentDate: Dayjs = dayjs();
  
  // State to track the current month and selected date
  const [today, setToday] = useState<Dayjs>(currentDate);
  const [selectDate, setSelectDate] = useState<Dayjs>(currentDate);

  const formattedDay: string = selectDate.format("dddd"); // Day of the week
  const formattedDate: string = selectDate.format("DD");  // Date of the month

  return (
    <>
      <div className="calendar-container">
  {/* Left Side - "Sunday" Section */}
  <div className="calendar-date">
    <h2>{formattedDay}</h2>
    <div className="special">
      <h1>{formattedDate}</h1>
    </div>
    <h3>Keep smiling</h3>
  </div>

  {/* Right Side - Calendar Grid */}
  <div className="calendar-wrapper">
    <div className="calendar-header">
      <h1 className="select-none font-semibold">
        {months[today.month()]}, {today.year()}
      </h1>
      <div className="calendar-controls">
  <GrFormPrevious onClick={() => setToday(today.month(today.month() - 1))} />
  <h1 onClick={() => setToday(currentDate)}>Today</h1>
  <GrFormNext onClick={() => setToday(today.month(today.month() + 1))} />
</div>

    </div>
    <div className="calendar-grid">
      {days.map((day, index) => (
        <h1 key={index} className="calendar-day-label">
          {day}
        </h1>
      ))}
    </div>
    <div className="dates-grid">
      {generateDate(today.month(), today.year()).map(
        ({ date, currentMonth, today: isToday }, index) => (
          <div
            key={index}
            className={cn(
              currentMonth ? "" : "not-in-current-month",
              isToday ? "today" : "",
              selectDate.toDate().toDateString() ===
              date.toDate().toDateString()
                ? "selected-date"
                : "",
              "date-cell"
            )}
            onClick={() => {
              setSelectDate(date);
            }}
          >
            {date.date()}
          </div>
        )
      )}
    </div>
  </div>
</div>

    </>
  );
}

export default Calendar