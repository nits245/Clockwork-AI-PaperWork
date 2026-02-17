import React, { useState, useEffect } from "react";
import "./Chat.scss";
import axios from "axios";
import { useFetchUser } from "../../hooks/useFetchUser";

const Chat: React.FC = () => {
    // Hosts a chat application
    // Users will be able to interact with other users in either direct message chats or group chats based on tasks and subtasks
    // As of yet (18/08/2025), no plans for any calling have been made

    // Chat function will interact with a backend service to manage chat messages and user interactions
    // Backend functionality will be implemented using Signal or Molly

    // Holds the current conversation
    var currentConversation: string | null = null;

    // The current user
    const [user, handleSignOut] = useFetchUser();

    return (
        // Houses the entire chat application
        <div id="Chat-Container">
            
            {/* Left side of the page */}
            <div id="Chat-Left">

                {/* Chat header section */}
                <div id="Chat-Header" className="Chat-Section">
                    <h1 className="heading">All Messages</h1>
                    <input type="text" placeholder="Search for a chat..." id="Chat-Search"/>
                </div>
                {/* Chat messages section */}
                <div id="Chat-Messages" className="Chat-Section">
                    {/* Messages will be dynamically loaded here */}
                    <p className="body">No messages yet. Start a conversation!</p>
                </div>

            </div>

            {/* Right side of the page */}
            <div id="Chat-Right">

                {/* Chat identifier section */}
                <div id="Chat-Identifier" className="Chat-Section">
                    <img src="" alt="" />
                    {/* Will display the current conversation the user is viewing */}
                    <p className="heading" id="Chat-Current-Conversation">
                        {currentConversation == null
                            ? "No conversation selected" 
                            : `Conversation: ${currentConversation}`
                        }
                    </p>
                </div>

                {/* Chat section */}
                <div id="Chat-Box" className="Chat-Section">
                </div>

                {/* Message box */}
                <div id="Chat-Message-Box" className="Chat-Section">
                    <input type="text" placeholder="Type a message..." id="Message-Box"/>
                    <button>Send</button>
                </div>
            </div>
        </div>
    )
}

export default Chat;