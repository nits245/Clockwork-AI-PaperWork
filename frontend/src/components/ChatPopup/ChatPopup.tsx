import React, { useState } from 'react';
import './ChatPopup.scss';
// Import the structured chat guides from the JSON file.
// This file contains categories of use cases, each with a title, a prompt, and a hint.
import chatGuides from './chatGuides.json';

// Define the structure for a single chat message.
// 'sender' can be 'user' or 'bot' to style messages differently.
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Define the structure for the chat guides data imported from JSON.
interface ChatGuide {
  category: string;
  useCases: {
    useCase: string; // Changed from 'title' to 'useCase' to match new JSON structure
    prompt: string;
    hint: string; // Changed from 'expectedAnswer' to 'hint'
  }[];
}

/**
 * ChatPopup Component
 * A floating action button that opens a chat window.
 * The chat window displays a conversation and provides quick-start hints based on chatGuides.json.
 * Updated: Fixed CSS and added proper styling for hint chips.
 */
const ChatPopup: React.FC = () => {
  // State to manage the visibility of the chat popup.
  const [isOpen, setIsOpen] = useState(false);
  // State to store the history of chat messages.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State for the user's current input in the text field.
  const [inputValue, setInputValue] = useState('');

  /**
   * Toggles the chat popup's visibility.
   * If opening for the first time, it adds an initial greeting from the bot.
   */
  const togglePopup = () => {
    setIsOpen(!isOpen);
    // Show a greeting message only on the first open.
    if (!isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);
    }
  };

  /**
   * Updates the input field's state as the user types.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  /**
   * Handles sending a message.
   * Adds the user's message to the chat, then simulates a bot response.
   */
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return; // Don't send empty messages.

    const userMessage: ChatMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);

    // Mock bot response for demonstration purposes.
    const botResponse: ChatMessage = { sender: 'bot', text: `I received: "${inputValue}". I am a mock assistant.` };
    // Simulate a delay for the bot's response to feel more natural.
    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputValue(''); // Clear the input field after sending.
  };

  /**
   * Handles clicking on a hint button.
   * It sends the hint's prompt as a message from the user.
   * @param prompt The prompt text from the clicked hint.
   */
  const handleHintClick = (prompt: string) => {
    const userMessage: ChatMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);

    // Find the corresponding hint to provide a mock answer.
    const allUseCases = (chatGuides as ChatGuide[]).flatMap(g => g.useCases);
    const matchingUseCase = allUseCases.find(uc => uc.prompt === prompt);
    const botResponseText = matchingUseCase ? matchingUseCase.hint : "I'm not sure how to answer that yet.";

    const botResponse: ChatMessage = { sender: 'bot', text: botResponseText };
    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  // If the popup is closed, only render the floating action button.
  return (
    <div className="chat-popup-container">
      <button className={`chat-fab ${isOpen ? 'open' : ''}`} onClick={togglePopup}>
        <span className="fab-icon">
          {isOpen ? '✕' : '🤖'}
        </span>
      </button>

      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="header-info">
              <div className="avatar">🤖</div>
              <div className="header-text">
                <h3 className="title">AI Assistant</h3>
                <p className="subtitle">Online</p>
              </div>
            </div>
            <button onClick={togglePopup} className="close-btn">✕</button>
          </div>
          <div className="chat-body">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            {/* Show hints only at the beginning of the conversation */}
            {messages.length === 1 && (
              <div className="chat-hints">
                <h4 className="hints-title">Here are some things you can ask:</h4>
                <div className="hints-container">
                  {(chatGuides as ChatGuide[]).flatMap(guide => guide.useCases).map(useCase => (
                    <button key={useCase.useCase} className="hint-chip" onClick={() => handleHintClick(useCase.prompt)}>
                      {useCase.hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="chat-input">
              <div className="input-container">
                <textarea
                  rows={1}
                  className="message-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Type a message..."
                />
                <button className="send-button" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
