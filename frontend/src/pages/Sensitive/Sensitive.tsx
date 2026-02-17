import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./Sensitive.scss";
import { CQ_RESULT, Student, useCipherQuery } from "../../hooks/useCipherQuery";
import AWS from "aws-sdk";

// Configure AWS SDK with Access Key and Secret Key (replace these for production)
AWS.config.update({
  region: "", // Replace with your AWS region
  accessKeyId: "", // Replace with your actual AWS access key ID
  secretAccessKey: "", // Replace with your actual AWS secret access key
});

export const CheckEmpty = (query: Student): boolean => {
  for (const prop in query) {
    // Access the value of each property
    if (query[prop as keyof Student] === "") {
      return true;
    }
  }
  return false;
};

// Create S3 client
const s3 = new AWS.S3();

const emptyStudent = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  student_id: "",
  title: "",
  age: "",
};

// Define the interface for a student record

// Functional component for displaying a warning message
const Sensitive: React.FC = () => {
  const [query, setQuery] = useState<Student | null>(null);
  const [validate, input] = useCipherQuery();
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Student>(emptyStudent);
  const [confirmInput, setConfirmInput] = useState(false);
  const [cqResult, setCqResult] = useState<null | CQ_RESULT>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newState = {
      ...formData,
      [name]: value,
    };
    console.log(newState);
    setFormData(newState);
    setIsEmpty(CheckEmpty(newState));
    setQuery(formData);
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Assuming you want to validate or send the formData to CipherQuery
    setQuery(formData);
  };

  // Handle image file selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle image upload submission to S3
  const handleImageUpload = async () => {
    if (!imageFile) {
      alert("Please select an image file first");
      return;
    }

    const bucketName = "student-id-images-bucket"; // Replace with your S3 bucket name
    const key = `uploads/${Date.now()}_${imageFile.name}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: imageFile,
      ContentType: imageFile.type,
    };

    try {
      // Upload image to S3
      const uploadResponse = await s3.upload(params).promise();
      console.log("Image uploaded successfully:", uploadResponse);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  const handleInput = () => {
    if (query) {
      if (!confirmInput) {
        setConfirmInput(true);
      } else {
        setLoading(true);
        setTimeout(async () => {
          const result = await input(query);
          setCqResult(result);
          setLoading(false);
        }, 2000);
        setConfirmInput(false);
      }
    }
  };

  const handleValidate = () => {
    if (query) {
      setLoading(true); // Start loading
      setTimeout(async () => {
        const result = await validate(query);
        setCqResult(result);
        setLoading(false);
      }, 2000);
    }
  };

  const handleResult = (result: CQ_RESULT) => {
    switch (result) {
      case CQ_RESULT.SUCCESS:
        return <div className="querySuccess">Operation was successful!</div>;
      case CQ_RESULT.FOUND:
        return <div className="querySuccess">Record found!</div>;
      case CQ_RESULT.NOT_FOUND:
        return <div className="queryFailure">Record not found. Try again.</div>;
      case CQ_RESULT.ERROR:
      default:
        return (
          <div className="queryFailure">
            An error occurred. Please try again.
          </div>
        );
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="sensitive-container">
        <div className="left-section">
          <div className="section">Data Validation</div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="id">Student ID:</label>
            <input
              type="text"
              id="id"
              className="form-input"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
            />

            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />

            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <label htmlFor="student_id">Student ID:</label>
            <input
              type="text"
              id="student_id"
              className="form-input"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
            />

            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              className="form-input"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />

            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              className="form-input"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
            />

            <div className="button-group">
              <button disabled={isEmpty} onClick={handleValidate}>
                Validate
              </button>
              <button disabled={isEmpty} onClick={handleInput}>
                {confirmInput ? "Confirm" : "Input"}
              </button>
            </div>
          </form>
          <div className="upload-container">
            <input
              className="upload-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="upload-image-input"
            />
            <label htmlFor="upload-image-input" className="upload-image-btn">
              Choose File
            </label>
            <button className="upload-image-btn" onClick={handleImageUpload}>
              Upload Image
            </button>
          </div>
        </div>
        <div className="image-container">
          <div className="image-wrapper">
            <img
              src={require("../../img/sensitive/validation.jpeg")}
              alt="Validation Icon"
            />
          </div>
        </div>
      </div>

      {cqResult !== null && handleResult(cqResult)}
    </>
  );
};

export default Sensitive;
