import React, { useState, useEffect, ChangeEvent } from "react";
import "./SignatureConfig.scss";
import axios from "axios";

// Type definitions for props and response data
interface SignatureConfigProps {
  savedItem: string[];
  setSaveItem: (items: string[]) => void;
  doc_id?: string; // Optional, as it may not always be passed
}

interface ApiDataItem {
  student_id?: number;
  address?: number;
  title?: number;
  age?: number;
  email?: number;
}

interface FormItem {
  id: number;
  name: string;
}

const SignatureConfig: React.FC<SignatureConfigProps> = ({
  savedItem,
  setSaveItem,
  doc_id,
}) => {
  const [apiData, setApiData] = useState<ApiDataItem[]>([]);
  const [selectedSubCats, setSelectedSubCats] = useState<string[]>([]);

  // Fetch API data when `doc_id` changes
  useEffect(() => {
    if (doc_id) {
      axios
        .get<ApiDataItem[]>(`http://localhost:8800/view-document/configurations/${doc_id}`)
        .then((response) => {
          setApiData(response.data);
          putSavedItem(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [doc_id]);

  // Function to map the data to saved items
  const putSavedItem = (data: ApiDataItem[]) => {
    const dataArray: string[] = [];

    if (data[0]?.student_id === 1) {
      dataArray.push("student_id");
    }
    if (data[0]?.address === 1) {
      dataArray.push("address");
    }
    if (data[0]?.title === 1) {
      dataArray.push("title");
    }
    if (data[0]?.age === 1) {
      dataArray.push("age");
    }
    if (data[0]?.email === 1) {
      dataArray.push("email");
    }

    setSaveItem(dataArray);
  };

  // Dummy data list
  const data: FormItem[] = [
    { id: 1, name: "firstname" },
    { id: 2, name: "lastname" },
    { id: 3, name: "student_id" },
    { id: 4, name: "address" },
    { id: 5, name: "title" },
    { id: 6, name: "date" },
    { id: 7, name: "age" },
    { id: 8, name: "signature" },
    { id: 9, name: "email" },
  ];

  // Handle checkbox change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setSelectedSubCats(
      checked
        ? [...selectedSubCats, value]
        : selectedSubCats.filter((item) => item !== value)
    );

    setSaveItem(
      checked
        ? [...savedItem, value]
        : savedItem.filter((item) => item !== value)
    );
  };

  return (
    <div className="signature">
      <div className="header">Signature Configuration</div>
      <div className="container">
        <div className="box-list">
          {data?.map((item) => (
            <div className="inputItem" key={item.id}>
              <input
                type="checkbox"
                disabled={
                  item.id === 1 ||
                  item.id === 2 ||
                  item.id === 8 ||
                  item.id === 6
                }
                defaultChecked={
                  item.id === 1 ||
                  item.id === 2 ||
                  item.id === 8 ||
                  item.id === 6 ||
                  (item.id === 3 && apiData.some((obj) => obj.student_id === 1)) ||
                  (item.id === 4 && apiData.some((obj) => obj.address === 1)) ||
                  (item.id === 5 && apiData.some((obj) => obj.title === 1)) ||
                  (item.id === 7 && apiData.some((obj) => obj.age === 1)) ||
                  (item.id === 9 && apiData.some((obj) => obj.email === 1))
                    ? true
                    : savedItem.includes(item.name)
                }
                id={item.id.toString()}
                value={item.name}
                onChange={handleChange} // Change event for checkbox
              />
              <label htmlFor={item.id.toString()}>{item.name}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignatureConfig;