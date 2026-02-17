import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import Faq from "../../img/navbar/faq.svg";
import Email from "../../img/navbar/email.svg";
import Search from "../../img/navbar/search.svg";
import Menu from "../../img/navbar/menu.svg";
import ChatIcon from "../../img/navbar/chat.svg";
import { createPopper } from "@popperjs/core";
import { useFetchUser } from "../../hooks/useFetchUser";

// Define the structure of the document data
interface Document {
  id: number;
  title: string;
  type: string;
}

const Navbar: React.FC = () => {
  const [search, setSearch] = useState<string>(""); // State for the search input
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]); // State for filtered documents
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // State for handling profile dropdown
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const [user, handleSignOut] = useFetchUser();

  // Refs for avatar and profile dropdown
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Popper instance for profile dropdown
  useEffect(() => {
    if (isProfileOpen && avatarRef.current && dropdownRef.current) {
      createPopper(avatarRef.current, dropdownRef.current, {
        placement: "bottom-end",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 10], // Adjust the offset between avatar and dropdown
            },
          },
        ],
      });
    }
  }, [isProfileOpen]);

  // Add event listener to close the dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false); // Close dropdown when clicking outside
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const searchFound = event.target.value.toLowerCase();
    setSearch(searchFound);

    const filtered = data.filter((document) =>
      document.title.toLowerCase().includes(searchFound)
    );
    setFilteredDocuments(filtered);
  };

  const handleSearchBoxClick = () => {
    setFilteredDocuments(data);
  };

  const handleSearchBoxBlur = () => {
    setSearch("");
    setFilteredDocuments([]);
  };

  const handleSearchResultClick = (document_type: string) => {
    const mappingLink: Record<string, string> = {
      contact: "/contact",
      faq: "/faq",
      Home: "/",
      viewDoc: "/viewDoc",
      Type_A: "/viewDoc/Type_A",
      Type_B: "/viewDoc/Type_B",
      Type_C: "/viewDoc/Type_C",
    };

    const link = mappingLink[document_type] || "/";
    navigate(link);
    handleSearchBoxBlur();
  };

  const tooltips = [
    { icon: Faq, text: "Frequently Asked Question", link: "/faq" },
    { icon: Email, text: "Contact", link: "/contact" },
    { icon: ChatIcon, text: "Chat", link: "/chat" },
  ];

  const onClickIcons = (link: string) => {
    if (link === "ChatPopup") {
      setIsChatOpen(!isChatOpen);
      return;
    }
    else if (link !== "") {
      navigate(link);
    }
  };

  // Handle profile dropdown toggle on avatar click
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };



  // Dummy data for the search
  const data: Document[] = [
    { id: 1, title: "Non-Disclosure Agreement", type: "Type_A" },
    { id: 2, title: "Employment Agreement", type: "Type_B" },
    { id: 3, title: "Company Termination Agreement", type: "Type_C" },
    { id: 4, title: "Home", type: "Home" },
    { id: 5, title: "Contact", type: "contact" },
    { id: 6, title: "View-Doc", type: "viewDoc" },
    { id: 7, title: "Faq", type: "faq" },
  ];


  
  return (
    <div className="navbar">
      <div className="left-nav">
        {/* 
        <div className="logo">
          <img src={Menu} alt="Menu" />
          <span>
            <Link to="/">Paperwork</Link>
          </span>
        </div> 
        */}
      </div>

      <div className="mid-nav">
        <div className="search">
          <input
            type="text"
            placeholder="search"
            value={search}
            onClick={handleSearchBoxClick}
            onChange={handleSearchInputChange}
            onBlur={() => setTimeout(handleSearchBoxBlur, 200)} // Delay blur to allow search result clicks
          />
          <img src={Search} alt="Search" className="search-icon" />
          {filteredDocuments.length > 0 && (
            <div className="filtered-results">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="filtered-result"
                  onClick={() => handleSearchResultClick(document.type)}
                >
                  {document.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="right-nav">

        {/* Avatar with click to toggle profile dropdown */}
        <div className="avatar" ref={avatarRef} onClick={toggleProfileDropdown}>
          <img
            style={{ borderRadius: "50%" }}
            src={user?.picture}
            alt="User Avatar"
          />
        </div>

        {tooltips.map((tooltip, index) => (
          <div key={index} onClick={() => onClickIcons(tooltip.link)}>
            <img src={tooltip.icon} alt={tooltip.text} />
          </div>
        ))}

        {/* Profile dropdown */}
        {isProfileOpen && (
          <div
            ref={dropdownRef}
            className="profile-dropdown"
            style={{ zIndex: 1000 }} // Ensure dropdown appears above other elements
          >
            <div className="profile-info">
              <p>{user?.email}</p>
            </div>
            <div className="logout">
              <button onClick={handleSignOut}>Log Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
