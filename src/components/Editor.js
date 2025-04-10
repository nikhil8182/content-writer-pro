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
        <button 
          className={`toolbar-button preview-toggle ${isPreviewMode ? 'active' : ''}`}
          onClick={togglePreviewMode}
        >
          {isPreviewMode ? 'Edit' : 'Preview'}
        </button>
        <div className={`char-counter ${getCharCounterClass()}`}>
          <span className={charCount > currentLimit ? 'over-limit' : ''}>
            {charCount}
          </span>
          <span>/</span>
          <span>{currentLimit}</span>
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
          <textarea 
            value={content}
            onChange={handleContentChange}
            placeholder={`Start writing your ${platform} content here...`}
            className="editor-textarea"
          ></textarea>
        )}
      </div>
      
      <div className="editor-footer">
        <div className="ai-actions">
          <button 
            className="action-button primary generate-button"
            onClick={generatePlatformContent}
            disabled={isGeneratingAI || !contentDescription}
          >
            {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
          </button>
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
                <li>Add relevant context to images</li>
                <li>Use concise, engaging language</li>
                <li>Maintain brand voice consistency</li>
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