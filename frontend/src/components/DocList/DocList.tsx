import React from "react";
import "./DocList.scss";
import Doc from "./Doc/Doc";

// Define the structure of the data prop
interface DocListProps {
  data: {
    id: string;
    title: string;
    date: string;
    count: number;
  }[];
}

// DocList component to display a list of documents
const DocList: React.FC<DocListProps> = ({ data }) => {
  return (
    <div className="docList">
      {data?.map((item) => (
        <Doc key={item.id} data={item} id={item.id} />
      ))}
    </div>
  );
};

export default DocList;