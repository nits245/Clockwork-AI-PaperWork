import axios from "axios";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  student_id: string;
  title: string;
  age: string;
}

export const enum CQ_RESULT {
  SUCCESS,
  FOUND,
  NOT_FOUND,
  ERROR,
}

// Move to env variable
const CQ_PORT = process.env.CQ_PORT || 8902; // Default to 8902 if not set
const BASE_URL = `http://localhost:${CQ_PORT}`; // Assuming local host

type CipherQueryFunction = (query: Student) => Promise<CQ_RESULT>;

export function useCipherQuery(): [
  validate: CipherQueryFunction,
  input: CipherQueryFunction,
] {
  const validate = async (query: Student) => {
    try {
      const response = await axios.post(`${BASE_URL}/validate`, {
        query: JSON.stringify(query),
      });

      if (response.status === 200) {
        return CQ_RESULT.FOUND;
      }
      if (response.status === 204) {
        return CQ_RESULT.NOT_FOUND;
      }
    } catch (error) {
      return CQ_RESULT.ERROR;
    }
    return CQ_RESULT.ERROR;
  };

  const input = async (query: Student) => {
    try {
      const response = await axios.post(`${BASE_URL}/input`, {
        query: JSON.stringify(query),
      });

      if (response.status === 201) {
        return CQ_RESULT.SUCCESS;
      }
    } catch (error) {
      return CQ_RESULT.ERROR;
    }
    return CQ_RESULT.ERROR;
  };

  return [validate, input];
}
