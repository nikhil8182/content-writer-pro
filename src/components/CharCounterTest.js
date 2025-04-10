import React, { useState } from 'react';
import './Editor.css'; // Reusing the Editor styles

// A simple component to test the character counter functionality
const CharCounterTest = () => {
  const [text, setText] = useState('');
  const charLimit = 280; // Twitter's character limit
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  // Calculate warning level based on percentage of limit used
  const getCharCounterClass = () => {
    const charCount = text.length;
    const percentUsed = (charCount / charLimit) * 100;
    if (charCount > charLimit) {
      return 'over-limit';
    } else if (percentUsed >= 85) {
      return 'near-limit';
    }
    return '';
  };
  
  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Character Counter Test</h2>
      
      <div className="editor-textarea-container" style={{ marginBottom: '20px' }}>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Type here to test the character counter..."
          className="editor-textarea"
          style={{ height: '150px' }}
        />
        <div className={`char-counter-inline ${getCharCounterClass()}`}>
          <span className={text.length > charLimit ? 'over-limit' : ''}>
            {text.length}
          </span>
          <span>/</span>
          <span>{charLimit}</span>
        </div>
      </div>
      
      {text.length > charLimit && (
        <div style={{ 
          color: '#e74c3c', 
          marginTop: '10px', 
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Your text is {text.length - charLimit} characters over the limit.
        </div>
      )}
    </div>
  );
};

export default CharCounterTest; 