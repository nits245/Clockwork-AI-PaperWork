import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthCheck from "../../utils/useAuthCheck";
import Home from "../../pages/Home/Home";
import Navbar from "../Navbar/Navbar";
import SideBar from "../Sidebar/SideBar";
import CreateDoc from "../../pages/CreateDoc/CreateDoc";
import ViewDoc from "../../pages/ViewDoc/ViewDoc";
import ViewDocumentDetail from "../../pages/ViewDocumentDetail/ViewDocumentDetail";
import TemplatePreview from "../../pages/TemplatePreview/TemplatePreview";
import DocControl from "../../pages/DocControl/DocControl";
import SavedDocumentsControl from "../../pages/SavedDocumentsControl/SavedDocumentsControl";
import CustomizeDoc from "../../pages/CustomizeDoc/CustomizeDoc";
import EditDoc from "../../pages/EditDoc/EditDoc";
import ReviewDoc from "../../pages/ReviewDoc/ReviewDoc";
import Contact from "../../pages/Contact/Contact";
import Faq from "../../pages/Faq/Faq";
import Sensitive from "../../pages/Sensitive/Sensitive";
import Chat from "../../pages/Chat/Chat";
import Policy from "../../pages/Policy/Policy"; // ✅ Import Policy page
import MasterVariables from "../../pages/MasterVariables/MasterVariables"; // ✅ Import Master Variables page
import "./Layout.scss";

// Layout component that handles routing and authentication
const Layout: React.FC = () => {
  const isAuthenticated = useAuthCheck();

  // Show loading state if authentication check is still in progress
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login page
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  return (
    <div className="app">
      <div className="left">
        <SideBar />
      </div>
      <div className="right">
        <Navbar />
        <Routes>
          {/* Define all the routes in the application */}
          <Route path="/" element={<Home />} />
          <Route path="/createDoc" element={<CreateDoc />} />
          <Route path="/viewDoc" element={<ViewDoc />} />
          <Route path="/view-document/:id" element={<ViewDocumentDetail />} />
          <Route path="/template-preview/:id" element={<TemplatePreview />} />
          <Route path="/viewDoc/saved-documents" element={<SavedDocumentsControl />} />
          <Route path="/viewDoc/:id" element={<DocControl />} />
          <Route path="/CustomizeDoc/:id/:type" element={<CustomizeDoc />} />
          <Route path="/editDoc/:id" element={<EditDoc />} />
          <Route path="/ReviewDoc/:id" element={<ReviewDoc />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/sensitive-data" element={<Sensitive />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/policy" element={<Policy />} /> {/* ✅ New Policy route */}
          <Route path="/master-variables" element={<MasterVariables />} /> {/* ✅ Master Variables route */}
          {/* Catch-all route redirects to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
