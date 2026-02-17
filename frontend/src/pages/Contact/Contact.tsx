import React, { useState, ChangeEvent, FormEvent } from "react";
import "./Contact.scss";
import Phone from "../../img/contact/Phone.svg";
import Mail from "../../img/contact/contact.svg";
import Location from "../../img/contact/location.svg";
import emailjs from "@emailjs/browser";
import SuccessfullMessage from "./ContactModal/SuccessfullMessage";

/**
 * Contact component for handling user inquiries.
 * 
 */
const Contact: React.FC = () => {
  // State for holding form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // State for toggling the success message modal
  const [open, setOpen] = useState(false);

  // Handle input changes for form fields
  const onChangeElement = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission and send email through emailjs API
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    emailjs
      .send(
        "service_hrg4t9j",
        "template_2xoy13u",
        formData,
        "cSmC1rfAbNHvFsW-H"
      )
      .then(
        (result) => {
          console.log(result.text);
          setOpen((prev) => !prev);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  // Render success message if form is successfully submitted
  if (open) {
    return <SuccessfullMessage />;
  }

  return (
    <div className="contact">
      <div className="contact-header">
        <span>
          <b>Get in Touch!</b>
        </span>
        <span className="quote">Contact us for a quote</span>
      </div>

      <div className="contact-info">
        {/* Location Information */}
        <div className="location">
          <img src={Location} alt="Location" />
          <div className="address">
            <span>234 Glenhuntly, Glenhuntly</span>
            <span>VIC, 3163</span>
          </div>
        </div>

        {/* Phone Information */}
        <div className="phone">
          <img src={Phone} alt="Phone" />
          <span>+655 449219024</span>
        </div>

        {/* Email Information */}
        <div className="mail">
          <img src={Mail} alt="Mail" />
          <span>
            <a href="mailto:Teampaperwork@proton.me">Teampaperwork@proton.me</a>
          </span>
        </div>
      </div>

      {/* Contact Form */}
      <div className="contact-form">
        <form onSubmit={handleSubmit}>
          <div className="detail">
            <div className="personal-detail">
              <label htmlFor="name">Your name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={onChangeElement}
                placeholder="Enter your name"
                required
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={onChangeElement}
                placeholder="Enter your Email"
                required
              />
              <label htmlFor="phone">Phone number</label>
              <input
                type="tel"
                pattern="^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}( |-){0,1}[0-9]{2}( |-){0,1}[0-9]{2}( |-){0,1}[0-9]{1}( |-){0,1}[0-9]{3}$"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={onChangeElement}
                placeholder="Enter your Phone number"
                required
              />
            </div>
            <div className="message">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={onChangeElement}
                placeholder="Enter your message!"
                required
              />
            </div>
          </div>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;