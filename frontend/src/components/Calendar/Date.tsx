import dayjs, { Dayjs } from "dayjs";

// Define the structure of a date object
interface DateObject {
  currentMonth: boolean;
  date: Dayjs;
  today?: boolean;
}

// Function to generate an array of dates for a given month and year
export const generateDate = (
  month: number = dayjs().month(),
  year: number = dayjs().year()
): DateObject[] => {
  const firstDateOfMonth = dayjs().year(year).month(month).startOf("month");
  const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");

  const arrayOfDate: DateObject[] = [];

  // Create prefix dates for the previous month days that appear in the calendar
  for (let i = 0; i < firstDateOfMonth.day(); i++) {
    const date = firstDateOfMonth.day(i);
    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  // Generate dates for the current month
  for (let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
    const currentDate = firstDateOfMonth.date(i);
    arrayOfDate.push({
      currentMonth: true,
      date: currentDate,
      today: currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
    });
  }

  // Add remaining dates to fill up the calendar (next month days)
  const remaining = 42 - arrayOfDate.length;
  for (let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
    const date = lastDateOfMonth.date(i);
    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  return arrayOfDate;
};

// Array of month names
export const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];