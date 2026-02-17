import React from "react";
import { Navigate } from "react-router-dom";
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import useAuthCheck from "../../utils/useAuthCheck";
import Logo from "./clockwork-logo.png";
import "./Login.scss";

enum Provider {
  GOOGLE = "Google",
  AMAZON = "Amazon",
}

const Login: React.FC = () => {
  const isAuthenticated = useAuthCheck();

  const handleFederatedLogin = async (provider: Provider) => {
    try {
      await signInWithRedirect({
        provider: provider === Provider.GOOGLE ? "Google" : { custom: "LoginWithAmazon" },
      });
    } catch (error) {
      console.error("Federated sign-in error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ global: true });
      window.location.href =
        "https://ap-southeast-2do0zvzlo7.auth.ap-southeast-2.amazoncognito.com/logout?client_id=un0t3utbt8p4a77jfang6fe3p&logout_uri=https%3A%2F%2Flab.crusaders.clockwork.vip";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="myContainer">
      <div className="Login">
        <img src={Logo} alt="Clockwork Logo" className="logo" />
        <h1 id="myh2">Log into the PaperWork Application</h1>
        <button id="button1" onClick={() => handleFederatedLogin(Provider.GOOGLE)}>
          <i className="fa-brands fa-google"></i> Sign in with Google
        </button>
        <button id="button2" onClick={() => handleFederatedLogin(Provider.AMAZON)}>
          <i className="fa-brands fa-amazon"></i> Sign in with Amazon
        </button>
        <button id="logout" onClick={handleLogout}>
          Force Logout
        </button>
      </div>
    </div>
  );
};

export default Login;
