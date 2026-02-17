import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of a data item
interface DataItem {
  id: string;
  title: string;
  date: string;
  amount: string;
}

// Define the initial state as an array of DataItem objects
const initialState: DataItem[] = [
  {
    id: "1",
    title: "Marraige Agreement",
    date: "12/12/2023",
    amount: "1",
  },
  {
    id: "2",
    title: "Non-disclosure Agreement",
    date: "12/12/2023",
    amount: "2",
  },
  {
    id: "3",
    title: "Security Policy",
    date: "12/12/2023",
    amount: "1",
  },
  {
    id: "4",
    title: "Data Privacy Policy",
    date: "12/12/2023",
    amount: "5",
  },
  {
    id: "5",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "6",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "7",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "8",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "9",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "10",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "11",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "12",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "13",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "14",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "15",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "16",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "17",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "18",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "19",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "20",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  },
  {
    id: "21",
    title: "Health Policy",
    date: "12/12/2023",
    amount: "0",
  }
]

// Create a slice for managing the data state
export const DataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<DataItem>) => {},
  },
});

// Export the generated action and reducer
export const { update } = DataSlice.actions;
export default DataSlice.reducer;