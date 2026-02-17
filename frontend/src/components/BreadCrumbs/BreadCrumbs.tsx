import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import "./BreadCrumbs.scss";

// Define the structure of the data item
interface DataItem {
  id: string;
  title: string;
}

// BreadCrumbs Component
const BreadCrumbs: React.FC = () => {
  // Access the Redux store 
  const data = useSelector((state: RootState) => state.data) as DataItem[];
  // Get URL and define string to build path
  const location = useLocation();
  let currentLink = "";

  // Generate breadcrumb links based on the current path
  const crumbs = location.pathname
    .split("/")
    .filter((crumb) => crumb !== "")
    .map((crumb) => {
      currentLink += `/${crumb}`;

      // Determine the label for the BreadCrumb
      const crumbLabel =
        crumb === "viewDoc"
          ? "View Document"
          : data?.find((item) => item.id === crumb)?.title || crumb;
      
      // Return a span containing a Link component for each breadcrumb
      return (
        <span key={crumb} className="breadCrumb">
          <Link to={currentLink}>{crumbLabel}</Link>
        </span>
      );
    });
  
  // Render the list of breadcrumbs inside a div
  return <div>{crumbs}</div>;
};

export default BreadCrumbs;