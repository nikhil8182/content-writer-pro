import React, { useState, useEffect } from 'react';
import './Editor.css';
import OpenAIService from '../services/openai';
import { getOutlineInstruction, getOptimizeInstruction } from './ConfigPage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Editor({ 
  platform = 'default', 
  contentDescription = '', 
  contentType = '', 
  initialOutline = '',
  onContentChange = () => {}
}) {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
    onContentChange(newContent);
  };
  
  // Use platform limits from the OpenAI service
  const platformLimits = OpenAIService.PLATFORM_LIMITS;
  const currentLimit = platformLimits[platform] || platformLimits.default;

  // Calculate warning level based on percentage of limit used
  const getCharCounterClass = () => {
    const percentUsed = (charCount / currentLimit) * 100;
    if (charCount > currentLimit) {
      return 'over-limit';
    } else if (percentUsed >= 85) {
      return 'near-limit';
    }
    return '';
  };

  // Pre-populate editor with initial outline if provided
  useEffect(() => {
    if (initialOutline && !content) {
      optimizeOutlineWithAI();
    }
  }, [initialOutline, platform]);

  const optimizeOutlineWithAI = async () => {
    setIsOptimizing(true);
    try {
      // Get the instruction from ConfigPage
      const configPageInstruction = getOptimizeInstruction();
      
      // Use the consolidated OpenAIService for optimization
      const optimizedContent = await OpenAIService.optimizeForPlatform(
        initialOutline, // Use the initial outline as the base for optimization
        platform,
        contentType,
        configPageInstruction // Pass the ConfigPage instruction
      );
      setContent(optimizedContent);
      onContentChange(optimizedContent);

    } catch (error) {
      setContent(initialOutline); // Fall back to using the unoptimized outline
      onContentChange(initialOutline);
    } finally {
      setIsOptimizing(false);
    }
  };

  const generatePlatformContent = async () => {
    setIsGeneratingAI(true);
    try {
      // Get the instruction from ConfigPage
      const configPageInstruction = getOptimizeInstruction();
      
      // Using optimizeForPlatform as the standard way to generate/optimize
      const generatedContent = await OpenAIService.optimizeForPlatform(
        contentDescription, // Using description as input for generation/optimization
        platform,
        contentType,
        configPageInstruction // Pass the ConfigPage instruction
      );
      setContent(generatedContent);
      onContentChange(generatedContent);
    } catch (error) {
      alert('Failed to generate content. Please try again or check your API settings.');
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Toggle between edit and preview modes
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  // Get platform-specific tips
  const getPlatformTips = () => {
    switch(platform) {
      case 'twitter':
        return [
          `Keep it under ${currentLimit} characters`,
          'Use 1-2 relevant hashtags',
          'Include a clear call to action'
        ];
      case 'linkedin':
        return [
          'Professional tone works best',
          'Include industry insights',
          'End with a question to drive engagement'
        ];
      case 'instagram':
        return [
          'Add relevant context for images',
          'Use concise, engaging language',
          'Maintain brand voice consistency'
        ];
      case 'blog':
        return [
          'Include a compelling headline',
          'Structure with headers for scanability',
          'Aim for 1000+ words for SEO'
        ];
      default:
        return [
          'Keep content clear and concise',
          'Use appropriate tone for your audience',
          'Include a call to action'
        ];
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
      
      <div className="editor-header">
        <div className="platform-badge">
          <span className="platform-icon">
            {platform === 'twitter' && '🐦'}
            {platform === 'linkedin' && '💼'}
            {platform === 'instagram' && '📸'}
            {platform === 'blog' && '📝'}
            {!['twitter', 'linkedin', 'instagram', 'blog'].includes(platform) && '📄'}
          </span>
          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
          <div className={`char-counter ${getCharCounterClass()}`}>
            <span className={charCount > currentLimit ? 'over-limit' : ''}>
              {charCount}
            </span>
            <span>/</span>
            <span>{currentLimit}</span>
          </div>
        </div>
        
        <div className="editor-actions">
          <button 
            className={`view-toggle-btn ${isPreviewMode ? 'active' : ''}`}
            onClick={togglePreviewMode}
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>
      
      <div className="editor-main">
        {isPreviewMode ? (
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="editor-textarea-container">
            <textarea 
              value={content}
              onChange={handleContentChange}
              placeholder={`Write your optimized ${platform} content here...`}
              className="editor-textarea"
            ></textarea>
            <div className={`char-counter-inline ${getCharCounterClass()}`}>
              <span className={charCount > currentLimit ? 'over-limit' : ''}>
                {charCount}
              </span>
              <span>/</span>
              <span>{currentLimit}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="editor-footer">
        <div className="ai-actions">
          <button 
            className="action-button primary generate-button"
            onClick={generatePlatformContent}
            disabled={isGeneratingAI || !contentDescription}
          >
            {isGeneratingAI ? 'Generating...' : 'Regenerate with AI'}
          </button>
        </div>
        
        <div className="platform-tips-compact">
          <h3>Tips for {platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
          <ul>
            {getPlatformTips().map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Editor; 