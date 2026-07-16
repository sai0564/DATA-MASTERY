import './ChatBubble.css';

function ChatBubble({ sender, text, isTyping }) {
  const isMentor = sender === 'maya' || sender === 'leo';

  return (
    <div className={`chat-bubble ${isMentor ? 'chat-bubble--mentor' : 'chat-bubble--system'}`}>
      {isMentor && (
        <div className="chat-bubble__avatar">
          {sender === 'maya' ? '👩‍💻' : '👨‍🔬'}
        </div>
      )}
      <div className="chat-bubble__content">
        {isMentor && (
          <span className="chat-bubble__name">
            {sender === 'maya' ? 'Maya' : 'Leo'}
          </span>
        )}
        <div className="chat-bubble__text">
          {isTyping ? (
            <div className="chat-bubble__typing">
              <span className="chat-bubble__typing-dot" />
              <span className="chat-bubble__typing-dot" />
              <span className="chat-bubble__typing-dot" />
            </div>
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;
