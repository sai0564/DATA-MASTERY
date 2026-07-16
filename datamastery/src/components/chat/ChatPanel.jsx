import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble.jsx';
import './ChatPanel.css';

/**
 * ChatPanel displays a list of chat messages and auto-scrolls to the bottom.
 * Messages format: { id, sender: 'maya'|'leo'|'system', text, isTyping? }
 */
function ChatPanel({ messages, mentor = 'maya', onDatasetPreview }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel" id="chat-panel">
      <div className="chat-panel__messages">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            text={msg.text}
            isTyping={msg.isTyping}
            timestamp={msg.timestamp}
            onDatasetPreview={onDatasetPreview}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatPanel;
