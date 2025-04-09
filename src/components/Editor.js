import React, { useState, useEffect } from 'react';
import './Editor.css';
import OpenAIService from '../services/openai';
import GPT4oService from '../services/gpt4o';

function Editor({ 
  platform = 'default', 
  contentDescription = '', 
  contentType = '', 
  initialOutline = '',
  onContentChange = () => {}
}) {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
    onContentChange(newContent);
  };
  
  // Use platform limits from the OpenAI service
  const platformLimits = OpenAIService.PLATFORM_LIMITS;
  const currentLimit = platformLimits[platform] || platformLimits.default;

  // Generate AI suggestion based on content type and description
  useEffect(() => {
    if (contentType || contentDescription) {
      generateAiSuggestion();
    } else {
      setAiSuggestion('');
    }
  }, [contentType, contentDescription, platform, initialOutline]);

  // Pre-populate editor with initial outline if provided
  useEffect(() => {
    if (initialOutline && !content) {
      // Try to use OpenAI for optimization if API key exists
      const hasApiKey = localStorage.getItem('openai_api_key') || process.env.REACT_APP_OPENAI_API_KEY;
      
      if (hasApiKey) {
        optimizeOutlineWithAI();
      } else {
        // Fall back to local optimization
        const optimizedVersion = optimizeOutlineForPlatform(initialOutline);
        setContent(optimizedVersion);
        onContentChange(optimizedVersion);
      }
    }
  }, [initialOutline, platform]);

  const optimizeOutlineWithAI = async () => {
    setIsOptimizing(true);
    try {
      // First try with GPT-4o service if available
      try {
        const optimizedContent = await GPT4oService.generatePlatformContent(
          contentDescription,
          platform,
          contentType
        );
        setContent(optimizedContent);
        onContentChange(optimizedContent);
        return; // If successful, exit the function
      } catch (error) {
        console.log('Falling back to standard OpenAI service:', error);
        // If GPT-4o fails, fall back to standard OpenAI service
        const optimizedContent = await OpenAIService.optimizeForPlatform(
          initialOutline,
          platform,
          contentType
        );
        setContent(optimizedContent);
        onContentChange(optimizedContent);
      }
    } catch (error) {
      console.error('Error optimizing with AI:', error);
      // Fallback to local optimization
      const optimizedVersion = optimizeOutlineForPlatform(initialOutline);
      setContent(optimizedVersion);
      onContentChange(optimizedVersion);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeOutlineForPlatform = (outline) => {
    // This would be much more sophisticated in a real app
    // For now, we'll do some simple transformations based on platform
    
    let optimized = outline;
    
    if (platform === 'twitter') {
      // For Twitter, convert to a more concise format, add hashtags
      optimized = outline
        .replace(/^# (.*?)$/gm, '$1')  // Remove markdown headers
        .replace(/^## (.*?)$/gm, '$1:') // Convert subheaders to text with colon
        .replace(/- (.*?)$/gm, '• $1')  // Change bullet style
        .split('\n\n')                  // Split into paragraphs
        .filter(para => para.trim())    // Remove empty lines
        .slice(0, 3)                    // Keep only first 3 paragraphs for brevity
        .join('\n\n');                  // Rejoin with double newlines
      
      // Add hashtags based on content type
      if (contentType === 'latest-news') {
        optimized += '\n\n#BreakingNews #Update';
      } else if (contentType === 'motivation') {
        optimized += '\n\n#Motivation #Growth';
      }
    } else if (platform === 'instagram') {
      // For Instagram, focus on visual descriptions and add emojis
      optimized = outline
        .replace(/^# (.*?)$/gm, '$1 ✨')  // Add emoji to main header
        .replace(/^## (.*?)$/gm, '$1 👉') // Add emoji to subheaders
        .replace(/- (.*?)$/gm, '• $1');   // Change bullet style
        
      optimized += '\n\n.\n.\n.\n#content #create';
    } else if (platform === 'linkedin') {
      // For LinkedIn, maintain professional tone, add call to engagement
      optimized = outline;
      optimized += '\n\nWhat are your thoughts on this topic? Share your experience in the comments below.';
    }
    
    return optimized;
  };

  const generateAiSuggestion = () => {
    let suggestion = '';
    
    // Simple suggestion system based on content type and platform
    if (contentType === 'latest-news') {
      if (platform === 'twitter') {
        suggestion = "Breaking: [Your news topic] has just been announced. Here's what you need to know in a thread. #BreakingNews #[YourTopic]";
      } else if (platform === 'linkedin') {
        suggestion = "Industry Update: [Your news topic] was just announced and here's how it might impact our industry. What are your thoughts on this development?";
      } else if (platform === 'instagram') {
        suggestion = "Swipe ➡️ to learn about [Your news topic] that was just announced! What do you think about this news? Let me know in the comments 👇";
      } else {
        suggestion = "Breaking News: [Your news topic] - A Comprehensive Analysis\n\nToday, we're breaking down the recently announced [news topic] and what it means for the industry.";
      }
    } else if (contentType === 'motivation') {
      if (platform === 'twitter') {
        suggestion = "Don't let temporary setbacks define your journey. Every obstacle is a stepping stone to success. Keep pushing forward! #Motivation #Growth";
      } else if (platform === 'linkedin') {
        suggestion = "The journey to success is never linear. We all face setbacks, but it's our ability to persevere that defines us. Share a challenge you've overcome in your career in the comments below.";
      } else {
        suggestion = "✨ Monday Motivation ✨\n\nRemember: Your current situation is not your final destination. Keep moving, learning, and growing!";
      }
    } else if (contentDescription) {
      suggestion = `Here's a draft based on your description: "${contentDescription}"\n\nClick to generate content for ${platform}...`;
    }
    
    setAiSuggestion(suggestion);
  };
  
  const generatePlatformContent = async () => {
    setIsGeneratingAI(true);
    try {
      const generatedContent = await GPT4oService.generatePlatformContent(
        contentDescription,
        platform,
        contentType
      );
      setContent(generatedContent);
      onContentChange(generatedContent);
    } catch (error) {
      console.error('Error generating platform content:', error);
      alert('Failed to generate content. Please try again or check your API settings.');
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  return (
    <div className="editor-container">
      {isOptimizing && (
        <div className="editor-overlay">
          <div className="editor-loading">
            <div className="loading-spinner"></div>
            <p>Optimizing content for {platform}...</p>
          </div>
        </div>
      )}
      
      <div className="editor-toolbar">
        <button className="toolbar-button">B</button>
        <button className="toolbar-button">I</button>
        <button className="toolbar-button">U</button>
        <span className="separator"></span>
        <button className="toolbar-button">H1</button>
        <button className="toolbar-button">H2</button>
        <span className="separator"></span>
        <button className="toolbar-button">List</button>
        <button className="toolbar-button">Link</button>
        <button className="toolbar-button">Image</button>
        <div className="toolbar-spacer"></div>
        <div className="char-counter">
          <span className={charCount > currentLimit ? 'over-limit' : ''}>
            {charCount}
          </span>
          <span>/</span>
          <span>{currentLimit}</span>
        </div>
      </div>
      
      <div className="editor-main">
        <textarea 
          value={content}
          onChange={handleContentChange}
          placeholder={`Start writing your ${platform} content here...`}
          className="editor-textarea"
        ></textarea>
      </div>
      
      <div className="editor-footer">
        <div className="ai-suggestions">
          <h3>AI Suggestions for {platform}</h3>
          
          <div className="ai-actions">
            <button 
              className="action-button primary generate-button"
              onClick={generatePlatformContent}
              disabled={isGeneratingAI || !contentDescription}
            >
              {isGeneratingAI ? 'Generating...' : 'Generate with GPT-4o'}
            </button>
          </div>
          
          {aiSuggestion ? (
            <div className="suggestion-content">
              <p>{aiSuggestion}</p>
              <button 
                className="use-suggestion" 
                onClick={() => {
                  setContent(aiSuggestion);
                  onContentChange(aiSuggestion);
                }}
              >
                Use This Suggestion
              </button>
            </div>
          ) : (
            <div className="suggestion-placeholder">
              <p>AI is analyzing your content to provide platform-specific suggestions.</p>
            </div>
          )}
        </div>
        <div className="platform-info">
          <h3>Platform Tips</h3>
          <div className="platform-tips">
            {platform === 'twitter' && (
              <ul>
                <li>Keep it under {currentLimit} characters</li>
                <li>Use 1-2 relevant hashtags</li>
                <li>Include a clear call to action</li>
              </ul>
            )}
            {platform === 'linkedin' && (
              <ul>
                <li>Professional tone works best</li>
                <li>Include industry insights</li>
                <li>End with a question to drive engagement</li>
              </ul>
            )}
            {platform === 'instagram' && (
              <ul>
                <li>Visual language drives engagement</li>
                <li>Use emojis strategically</li>
                <li>Group hashtags at the end</li>
              </ul>
            )}
            {platform === 'blog' && (
              <ul>
                <li>Include a compelling headline</li>
                <li>Structure with headers for scanability</li>
                <li>Aim for 1000+ words for SEO</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor; 