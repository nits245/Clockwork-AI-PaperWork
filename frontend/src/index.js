import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { Provider } from "react-redux";
import store from "./components/Redux/store";
// Temporarily disabled AWS Amplify for local development
// import { Amplify } from "aws-amplify";
// import awsconfig from "./aws-exports";

// Amplify.configure(awsconfig);
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
