import React from "react";
import "./SuccessfullMessage.scss";
import Letter from "../../../img/contact/letter.svg";
import { Link } from "react-router-dom";

/**
 * Renders a success message modal with an image, message, and link to the home page.
 */
const SuccessfullMessage: React.FC = () => {
  return (
    <div className="message-content">
      <div className="modal-success">
        {/* Displays the letter image */}
        <img src={Letter} alt="Success" />

        {/* Main success message */}
        <span>
          <b>Thank you, enjoy!</b>
        </span>

        {/* Additional information about the process */}
        <span>
          Your quote has been received and is being reviewed by our support team.
        </span>
        <span>
          You will receive an email within 5 business days.
        </span>

        {/* Button to go back to the homepage */}
        <Link to="/">
          <button className="home-btn">Home</button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessfullMessage;