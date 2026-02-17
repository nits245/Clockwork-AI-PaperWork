import React, { useState, useEffect } from "react";
import "./Faq.scss";
import Faq_image from "../../img/faq/Faq.png";
import Arrow_down from "../../img/faq/arrow-down.png";
import Arrow_Expand from "../../img/faq/arrow-expand.png";
import axios from "axios";

// Define the type for each FAQ item
interface FaqItem {
  faq_id: number;
  faq_question: string;
  faq_answer: string;
  expand: boolean;
}

const Faq: React.FC = () => {
  // State for fetched FAQ data from the backend
  const [faq1, setFaq1] = useState<FaqItem[]>([]);

  // Fetch FAQ data from the backend
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const res = await axios.get<FaqItem[]>(`${process.env.REACT_APP_BACKEND_URL}/faq`);
        setFaq1(res.data);
      } catch (error) {
        console.error("Error fetching FAQ data:", error);
      }
    };
    fetchFaqData();
  }, []);

  // Toggle the expansion of a FAQ item
  const toggleFAQ = (index: number) => {
    setFaq1(
      faq1.map((faq, i) => {
        if (i === index) {
          faq.expand = !faq.expand;
        } else {
          faq.expand = false;
        }
        return faq;
      })
    );
  };

  return (
    <div className="faq">
      <div className="faq-header">
        <h2>Help centre</h2>
      </div>
      <div className="faq-para">
        <p>
          Frequently Asked <strong>Questions</strong>
        </p>
      </div>

      <div className="faq-container">
        <div className="left-container">
          <img src={Faq_image} alt="FAQ" />
          <div className="right-container">
            {faq1.map((faq, faq_id) => (
              <div className="faq-item" key={faq.faq_id}>
                <div className="faq-question" onClick={() => toggleFAQ(faq_id)}>
                  <h4>
                    {faq.faq_question}
                    {faq.expand ? (
                      <img src={Arrow_Expand} alt="Arrow" />
                    ) : (
                      <img src={Arrow_down} alt="Arrow Down" />
                    )}
                  </h4>
                </div>
                {faq.expand && <p className="faq-answer">{faq.faq_answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Faq;