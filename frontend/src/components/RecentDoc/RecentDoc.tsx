import React from "react";
import {Link} from "react-router-dom"
import Filter from "../../img/home/filter.svg";
import "./RecentDoc.scss";
import Doc from "../../img/home/doc.svg";

// Define the structure of each document item
interface DocDataItem {
  id:string,
  title: string;
  version: string;
  date_created: string;
}

// Define the props interface for RecentDoc component
interface RecentDocProps {
  docData: DocDataItem[];
}

const RecentDoc: React.FC<RecentDocProps> = ({ docData }) => {
  return (
    <>
      <div className="top-doc">
        <div className="doc-title">
          <span>DOCUMENT TITLE</span>
          <img src={Filter} alt="Filter Icon" />
        </div>
        <div className="doc-detail">
          <span>VERSION</span>
          <span>DATE CREATED</span>
        </div>
      </div>
      {docData?.map((item, index) => (
        <div className="bottom-doc" key={item.id}>
          <Link to={`/viewDoc/${item.id}`}>
            <div className="doc-container">
              <div className="doc-title">
                <img src={Doc} alt="Document Icon" />
                <span>{item.title}</span>
              </div>
              <div className="version-container">
                <div className="version-item">
                  <span className="version">{item.version}</span>
                  <span className="date">{item.date_created}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
};

export default RecentDoc;