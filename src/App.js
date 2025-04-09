import './App.css';
import Editor from './components/Editor';
import { useState, useEffect } from 'react';
import OpenAIService from './services/openai';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentType, setContentType] = useState('');
  const [generatedOutline, setGeneratedOutline] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState(process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4');
  const [apiKeyError, setApiKeyError] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');

  // Load API key and model preferences from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || process.env.REACT_APP_OPENAI_API_KEY || '';
    const savedModel = localStorage.getItem('openai_model') || process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4';
    const savedInstruction = localStorage.getItem('system_instruction') || '';
    setApiKey(savedApiKey);
    setAiModel(savedModel);
    setSystemInstruction(savedInstruction);
  }, []);

  // Content type presets
  const contentPresets = [
    { id: 'latest-news', label: 'Latest News' },
    { id: 'motivation', label: 'Motivation' },
    { id: 'info', label: 'Information' },
    { id: 'vibe-check', label: 'Vibe Check' },
    { id: 'surprise-me', label: 'Surprise Me' }
  ];

  const handleContentPresetClick = (preset) => {
    setContentType(preset.id);
    // Add predefined descriptions based on the preset
    switch(preset.id) {
      case 'latest-news':
        setContentDescription('Share the latest news and updates about trending topics');
        break;
      case 'motivation':
        setContentDescription('Inspirational message to motivate followers');
        break;
      case 'info':
        setContentDescription('Educational content providing valuable information');
        break;
      case 'vibe-check':
        setContentDescription('Casual check-in with followers about current mood');
        break;
      case 'surprise-me':
        setContentDescription('Something unexpected and creative');
        break;
      default:
        setContentDescription('');
    }
  };

  const generateAIOutline = async () => {
    setIsGenerating(true);
    try {
      // Check if API key exists
      const hasApiKey = localStorage.getItem('openai_api_key') || process.env.REACT_APP_OPENAI_API_KEY;
      
      if (hasApiKey) {
        // Use OpenAI service to generate outline
        const outline = await OpenAIService.generateOutline(contentDescription, contentType);
        setGeneratedOutline(outline);
      } else {
        // No API key, use fallback
        setGeneratedOutline(generateFallbackOutline());
        setApiKeyError('No OpenAI API key found. Using local outline generation instead. Add your API key in Config to use AI-powered generation.');
      }
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating outline:', error);
      // Fallback to local outline generation if API call fails
      setGeneratedOutline(generateFallbackOutline());
      setApiKeyError('Error connecting to OpenAI API. Using local outline generation instead.');
      setCurrentStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackOutline = () => {
    // Fallback outline generation when API call is not implemented or fails
    let outline = '';
    
    if (contentType === 'latest-news') {
      outline = "# Breaking News Update\n\n## Key Points\n- Main news development\n- Background context\n- Why this matters\n\n## Impact Analysis\n- Industry implications\n- What to watch for next";
    } else if (contentType === 'motivation') {
      outline = "# Motivational Message\n\n## Opening Hook\n- Attention-grabbing statement\n- Relatable scenario\n\n## Main Message\n- Key motivational concept\n- Supporting points\n\n## Call to Action\n- How to apply this motivation";
    } else if (contentType === 'info') {
      outline = "# Informational Guide\n\n## Introduction\n- Topic overview\n- Why this matters\n\n## Key Information\n- Primary facts\n- Secondary details\n- Expert insights\n\n## Practical Application\n- How to use this information";
    } else if (contentType === 'vibe-check') {
      outline = "# Vibe Check\n\n## Current Mood\n- Personal status update\n- Relatable feeling\n\n## Conversation Starter\n- Question for audience\n- Engagement prompt";
    } else if (contentType === 'surprise-me') {
      outline = "# Unexpected Content\n\n## Attention Grabber\n- Surprising fact or statement\n- Unusual perspective\n\n## Main Content\n- Unconventional idea\n- Creative approach\n\n## Memorable Closing\n- Thought-provoking takeaway";
    } else if (contentDescription) {
      outline = `# Custom Content: ${contentDescription}\n\n## Introduction\n- Opening hook based on your description\n- Set context\n\n## Main Points\n- Key idea 1\n- Key idea 2\n- Key idea 3\n\n## Conclusion\n- Summarizing thoughts\n- Next steps or call to action`;
    }
    
    return outline;
  };

  const selectPlatform = (platform) => {
    setCurrentPlatform(platform);
    setCurrentStep(3);
  };

  const optimizeForPlatform = async () => {
    setIsGenerating(true);
    try {
      // Check if API key exists
      const hasApiKey = localStorage.getItem('openai_api_key') || process.env.REACT_APP_OPENAI_API_KEY;
      
      if (hasApiKey) {
        // This will be handled in the Editor component when it renders
        // We're just advancing the step here
        setCurrentStep(4);
      } else {
        // Without API key, we'll just advance and use local optimization in the Editor
        setApiKeyError('No OpenAI API key found. Using local optimization instead. Add your API key in Config to use AI-powered optimization.');
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error optimizing for platform:', error);
      setApiKeyError('Error connecting to OpenAI API. Using local optimization instead.');
      setCurrentStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleToggle = () => {
    setIsScheduling(!isScheduling);
  };

  const handlePost = () => {
    // In a real app, this would handle the actual posting
    alert(`Content ${isScheduling ? 'scheduled' : 'posted'} to ${currentPlatform}!`);
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setContentDescription('');
    setContentType('');
    setGeneratedOutline('');
    setFinalContent('');
    setCurrentPlatform('');
    setIsScheduling(false);
    setScheduledDate('');
    setScheduledTime('');
    setApiKeyError('');
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
  };

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setAiModel(newModel);
  };

  const handleSystemInstructionChange = (e) => {
    const newInstruction = e.target.value;
    setSystemInstruction(newInstruction);
  };

  const saveSettings = () => {
    // Save API key and model to localStorage
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    } else {
      localStorage.removeItem('openai_api_key');
    }
    
    localStorage.setItem('openai_model', aiModel);
    
    // Save system instruction
    if (systemInstruction) {
      localStorage.setItem('system_instruction', systemInstruction);
    } else {
      localStorage.removeItem('system_instruction');
    }
    
    alert('Settings saved successfully!');
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Describe</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Outline</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Platform</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Optimize</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
          <div className="step-number">5</div>
          <div className="step-label">Publish</div>
        </div>
      </div>
    );
  };

  // Config view render function
  const renderConfigView = () => {
    return (
      <div className="config-view">
        <h2>Configuration</h2>
        <div className="config-section">
          <h3>User Settings</h3>
          <div className="config-form">
            <div className="form-group">
              <label>Display Name</label>
              <input type="text" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your.email@example.com" />
            </div>
            <div className="form-group">
              <label>Default Platform</label>
              <select>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="blog">Blog</option>
              </select>
            </div>
          </div>
        </div>
        <div className="config-section">
          <h3>AI Configuration</h3>
          <div className="config-form">
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="Enter your OpenAI API key" 
                value={apiKey}
                onChange={handleApiKeyChange}
              />
              <small className="form-helper">
                Your API key is stored locally and never sent to our servers. 
                {process.env.REACT_APP_OPENAI_API_KEY ? " An API key is already set in environment variables." : ""}
              </small>
            </div>
            <div className="form-group">
              <label>AI Model</label>
              <select value={aiModel} onChange={handleModelChange}>
                <option value="gpt-4">GPT-4 (Best quality)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
              </select>
            </div>
            <div className="form-group">
              <label>System Instruction</label>
              <textarea
                className="system-instruction"
                placeholder="Enter custom system instructions for the AI. This will be prepended to all prompts."
                value={systemInstruction}
                onChange={handleSystemInstructionChange}
                rows={5}
              ></textarea>
              <small className="form-helper">
                The system instruction guides AI behavior. For example: "You are a marketing expert specializing in engaging Gen Z audiences. Focus on trends, authenticity, and concise messaging."
              </small>
            </div>
            <div className="form-group">
              <label>Suggestion Style</label>
              <select>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>
        </div>
        <div className="preset-system-prompts">
          <h3>Example System Instructions</h3>
          <div className="preset-buttons">
            <button 
              className="preset-button"
              onClick={() => setSystemInstruction("You are a marketing expert who creates viral social media content. You understand trends, use relatable language, and craft messages that resonate with younger audiences.")}
            >
              Marketing Expert
            </button>
            <button 
              className="preset-button"
              onClick={() => setSystemInstruction("You are a professional journalist who writes clear, factual, and balanced content. You verify information, avoid sensationalism, and present multiple perspectives.")}
            >
              Journalist
            </button>
            <button 
              className="preset-button"
              onClick={() => setSystemInstruction("You are a storyteller who creates engaging narrative content. You use vivid descriptions, emotional hooks, and compelling character-driven scenarios.")}
            >
              Storyteller
            </button>
            <button 
              className="preset-button"
              onClick={() => setSystemInstruction("You are a technical writer who explains complex concepts clearly. You use precise language, provide examples, and break down difficult ideas into understandable components.")}
            >
              Technical Writer
            </button>
          </div>
        </div>
        <div className="save-button">
          <button className="action-button primary" onClick={saveSettings}>Save Settings</button>
        </div>
      </div>
    );
  };

  // Get content for the current view
  const renderContent = () => {
    switch(currentView) {
      case 'home':
        return renderHomeView();
      case 'config':
        return renderConfigView();
      default:
        return (
          <div className="home-view">
            <Editor platform="twitter" />
          </div>
        );
    }
  };

  // Home view render function (with all steps)
  const renderHomeView = () => {
    return (
      <div className="home-view">
        {renderStepIndicator()}
        
        {currentStep === 1 && (
          <div className="content-selection">
            <h2>What do you want to create today?</h2>
            
            <div className="content-description">
              <label htmlFor="content-description">Describe your content</label>
              <textarea 
                id="content-description"
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
                placeholder="Enter a description of what you want to write about..."
                className="content-textarea"
              />
            </div>
            
            <div className="content-presets">
              <p>Or select a content type:</p>
              <div className="preset-buttons">
                {contentPresets.map(preset => (
                  <button 
                    key={preset.id}
                    className={contentType === preset.id ? 'preset-button active' : 'preset-button'}
                    onClick={() => handleContentPresetClick(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="action-container">
              <button 
                className="action-button primary"
                onClick={generateAIOutline}
                disabled={(!contentDescription && !contentType) || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Outline'}
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="content-outline">
            <h2>AI-Generated Outline</h2>
            {apiKeyError && <div className="api-error-message">{apiKeyError}</div>}
            <div className="outline-container">
              <pre className="outline-content">{generatedOutline}</pre>
            </div>
            
            <div className="platform-selector">
              <h3>Select platform to optimize for</h3>
              <div className="platform-buttons">
                <button onClick={() => selectPlatform('twitter')}>Twitter</button>
                <button onClick={() => selectPlatform('linkedin')}>LinkedIn</button>
                <button onClick={() => selectPlatform('instagram')}>Instagram</button>
                <button onClick={() => selectPlatform('blog')}>Blog</button>
              </div>
            </div>
            
            <div className="action-container">
              <button className="action-button secondary" onClick={() => setCurrentStep(1)}>
                Back
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="platform-optimization">
            <h2>Optimize for {currentPlatform}</h2>
            <p className="platform-description">
              {currentPlatform === 'twitter' && 'Twitter posts work best when they are concise, use hashtags, and have a clear call to action.'}
              {currentPlatform === 'linkedin' && 'LinkedIn content should be professional, provide value, and include industry-specific insights.'}
              {currentPlatform === 'instagram' && 'Instagram posts should be visually focused, with engaging captions and strategic hashtags.'}
              {currentPlatform === 'blog' && 'Blog content should be comprehensive, well-structured, and optimized for SEO.'}
            </p>
            
            <div className="action-container">
              <button className="action-button secondary" onClick={() => setCurrentStep(2)}>
                Back
              </button>
              <button 
                className="action-button primary" 
                onClick={optimizeForPlatform}
                disabled={isGenerating}
              >
                {isGenerating ? 'Optimizing...' : 'Optimize Content'}
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 4 && (
          <div className="optimized-content">
            <h2>Optimized for {currentPlatform}</h2>
            {apiKeyError && <div className="api-error-message">{apiKeyError}</div>}
            
            <Editor 
              platform={currentPlatform} 
              contentDescription={contentDescription}
              contentType={contentType}
              initialOutline={generatedOutline}
              onContentChange={(newContent) => setFinalContent(newContent)}
            />
            
            <div className="action-container">
              <button className="action-button secondary" onClick={() => setCurrentStep(3)}>
                Back
              </button>
              <button className="action-button primary" onClick={() => setCurrentStep(5)}>
                Continue to Publishing
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 5 && (
          <div className="publishing-options">
            <h2>Publish to {currentPlatform}</h2>
            
            <div className="preview-container">
              <h3>Content Preview</h3>
              <div className="content-preview">
                <p>{finalContent || "Your optimized content will appear here."}</p>
              </div>
            </div>
            
            <div className="publishing-controls">
              <div className="schedule-toggle">
                <label className="toggle-container">
                  <input 
                    type="checkbox" 
                    checked={isScheduling}
                    onChange={handleScheduleToggle}
                  />
                  <span className="toggle-label">Schedule for later</span>
                </label>
              </div>
              
              {isScheduling && (
                <div className="schedule-form">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="action-container">
                <button className="action-button secondary" onClick={() => setCurrentStep(4)}>
                  Back
                </button>
                <button 
                  className="action-button primary"
                  onClick={handlePost}
                  disabled={isScheduling && (!scheduledDate || !scheduledTime)}
                >
                  {isScheduling ? 'Schedule Post' : 'Post Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Writer Pro</h1>
          <div className="nav-menu">
            <button 
              className={currentView === 'home' ? 'nav-button active' : 'nav-button'} 
              onClick={() => {
                setCurrentView('home');
                resetWorkflow();
              }}>
              Write
            </button>
            <button 
              className={currentView === 'config' ? 'nav-button active' : 'nav-button'} 
              onClick={() => setCurrentView('config')}>
              Config
            </button>
          </div>
        </div>
      </header>
      
      <div className="App-container">
        <main className="App-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
