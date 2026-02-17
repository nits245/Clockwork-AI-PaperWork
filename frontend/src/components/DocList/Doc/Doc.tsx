import React from "react";
import Folder from "../../../img/viewDoc/folder.svg";
import "./Doc.scss";
import { Link } from "react-router-dom";

// Define the structure of the data prop
interface DocProps {
  data: {
    title: string;
    date: string;
    count: number;
  };
  id: string;
}

// Doc component to display document details
const Doc: React.FC<DocProps> = ({ data, id }) => {
  return (
    <Link to={`${id}`}>
      <div className="doc">
        <div className="folder-icon">
          <img src={Folder} alt="Folder Icon" />
        </div>

        <div className="folder-detail">
          <div className="title">{data.title}</div>
          <div className="amount">{data.count} Items</div>
        </div>
      </div>
    </Link>
  );
};

export default Doc;