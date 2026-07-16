import './ChatBubble.css';

/**
 * Renders individual chat bubbles.
 * Parses text contents to support block code, inline code, and dataset file attachments.
 */
function ChatBubble({ sender, text, isTyping, timestamp, onDatasetPreview }) {
  const isMentor = sender === 'maya' || sender === 'leo';

  // 1. Check for file attachment references (e.g., 📎 customers.csv)
  const attachmentRegex = /📎\s*(\S+\.csv)/;
  const hasAttachment = text && attachmentRegex.test(text);
  const attachmentFile = hasAttachment ? text.match(attachmentRegex)[1] : null;
  
  // Clean text from attachment markdown for body rendering
  const cleanText = hasAttachment ? text.replace(attachmentRegex, '').trim() : text;

  // 2. Parse code blocks: ```python ... ```
  const parseMessageContent = (msgText) => {
    if (!msgText) return [];

    const codeBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(msgText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: msgText.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code-block', content: match[1] });
      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < msgText.length) {
      parts.push({ type: 'text', content: msgText.substring(lastIndex) });
    }

    if (parts.length === 0) {
      return [{ type: 'text', content: msgText }];
    }

    return parts;
  };

  // 3. Render inline backtick formatting: `df.head()`
  const formatInlineCode = (txt) => {
    if (!txt) return '';
    const inlineRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(txt)) !== null) {
      if (match.index > lastIndex) {
        parts.push(txt.substring(lastIndex, match.index));
      }
      parts.push(<code key={match.index}>{match[1]}</code>);
      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < txt.length) {
      parts.push(txt.substring(lastIndex));
    }

    return parts.length > 0 ? parts : txt;
  };

  const messageParts = parseMessageContent(cleanText);

  // Render function for parsed segments
  const renderMessageContent = () => {
    if (isTyping) {
      return (
        <div className="chat-bubble__typing">
          <span className="chat-bubble__typing-dot" />
          <span className="chat-bubble__typing-dot" />
          <span className="chat-bubble__typing-dot" />
        </div>
      );
    }

    return (
      <div className="chat-bubble__body">
        {messageParts.map((part, idx) => {
          if (part.type === 'code-block') {
            return (
              <pre key={idx} className="chat-bubble__code-block">
                <code>{part.content}</code>
              </pre>
            );
          }
          
          // Split paragraph breaks
          const lines = part.content.split('\n');
          return (
            <div key={idx} className="chat-bubble__paragraphs">
              {lines.map((line, lIdx) => (
                <p key={lIdx} className="chat-bubble__paragraph">
                  {formatInlineCode(line)}
                </p>
              ))}
            </div>
          );
        })}

        {/* Render styled database attachment card */}
        {hasAttachment && attachmentFile && (
          <div 
            className="chat-bubble__attachment-card animate-fade-in-up" 
            onClick={() => onDatasetPreview && onDatasetPreview(attachmentFile)}
            title="Click to view file structure"
            id={`attachment-card-${attachmentFile.replace('.', '-')}`}
          >
            <div className="chat-bubble__attachment-icon">📊</div>
            <div className="chat-bubble__attachment-details">
              <span className="chat-bubble__attachment-filename">{attachmentFile}</span>
              <span className="chat-bubble__attachment-size">Seeded CSV File · Click for details</span>
            </div>
            <span className="chat-bubble__attachment-action">inspect</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chat-bubble ${isMentor ? 'chat-bubble--mentor' : 'chat-bubble--system'} ${isTyping ? 'chat-bubble--typing' : ''}`}>
      {isMentor && (
        <div className="chat-bubble__avatar-container">
          <div className="chat-bubble__avatar">
            {sender === 'maya' ? '👩‍💻' : '👨‍🔬'}
          </div>
        </div>
      )}
      <div className="chat-bubble__content">
        {isMentor && (
          <div className="chat-bubble__meta-row">
            <span className="chat-bubble__name">
              {sender === 'maya' ? 'Maya' : 'Leo'}
            </span>
            {timestamp && <span className="chat-bubble__timestamp">{timestamp}</span>}
          </div>
        )}
        <div className="chat-bubble__text">
          {renderMessageContent()}
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;
