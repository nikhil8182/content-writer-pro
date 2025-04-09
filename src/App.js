import './App.css';
import Editor from './components/Editor';
import ConfigPage from './components/ConfigPage';
import { getOutlineInstruction } from './components/ConfigPage';
import { useState, useEffect } from 'react';
import OpenAIService from './services/openai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [aiModel, setAiModel] = useState(process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4');
  const [apiKeyError, setApiKeyError] = useState('');

  // Load model preferences only - removed system instruction loading
  useEffect(() => {
    const savedModel = localStorage.getItem('openai_model') || process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4';
    setAiModel(savedModel);
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
      // Get the instruction from ConfigPage
      const configPageInstruction = getOutlineInstruction();
      
      // Use OpenAI service to generate outline
      const outline = await OpenAIService.generateOutline(
        contentDescription, 
        contentType,
        configPageInstruction // Pass the ConfigPage instruction
      );
      setGeneratedOutline(outline);
      setCurrentStep(2);
    } catch (error) {
      setApiKeyError('Error connecting to OpenAI API. Please check your configuration.');
      // Stay on current step when there's an error
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPlatform = (platform) => {
    setCurrentPlatform(platform);
    setCurrentStep(3);
  };

  const optimizeForPlatform = async () => {
    setIsGenerating(true);
    try {
      // Simply advance to the next step - the Editor component will handle the actual optimization
      setCurrentStep(4);
    } catch (error) {
      console.error('Error moving to optimization step:', error);
      setApiKeyError('An error occurred. Please try again.');
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

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setAiModel(newModel);
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
    return <ConfigPage />;
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
              <div className="outline-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedOutline}
                </ReactMarkdown>
              </div>
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
                {finalContent ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {finalContent}
                  </ReactMarkdown>
                ) : (
                  <p>Your optimized content will appear here.</p>
                )}
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
