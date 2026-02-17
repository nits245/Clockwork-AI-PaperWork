import React, { useState } from "react";
import "./Navbar.scss";
import "../TextEditor/TextEditor.scss";

// Define props interface for Tooltip component
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Show tooltip on mouse enter
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  // Hide tooltip on mouse leave
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showTooltip && <div className="tooltip">{text}</div>}
      {children}
    </div>
  );
};

export default Tooltip;