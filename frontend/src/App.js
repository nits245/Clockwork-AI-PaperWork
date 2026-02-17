import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import "./_ThemeVariables.scss";
import "./styles/cursor-fixes.css";
import Login from "./pages/Login/Login";
import Layout from "./components/Layout/Layout";
import ChatPopup from './components/ChatPopup/ChatPopup';
import { KeyboardManagerProvider } from './hooks/useKeyboardManager';
// Temporarily disabled AWS Amplify for local development
// import { Amplify } from 'aws-amplify';
// import awsExports from './aws-exports';

// Amplify.configure(awsExports);

const App = () => {
  return (
    <KeyboardManagerProvider options={{ 
      debug: true, 
      autoStart: true,
      chatHooks: {
        onSendMessage: (message) => console.log('Send message:', message),
        onToggleChat: () => console.log('Toggle chat'),
        onMessageHistory: (direction) => console.log('Message history:', direction),
        onFocusSearch: () => console.log('Focus search')
      }
    }}>
      <div className="App">
        <Router 
          future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </Router>
        <ChatPopup />
      </div>
    </KeyboardManagerProvider>
  );
};

export default App;
