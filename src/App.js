import './App.css';
import Editor from './components/Editor';
import ConfigPage from './components/ConfigPage';
import ThemeSwitcher from './components/ThemeSwitcher';
import { getOutlineInstruction } from './components/ConfigPage';
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './contexts/ThemeContext';
import OpenAIService from './services/openai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const { theme } = useContext(ThemeContext);
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
  const [apiKeyError, setApiKeyError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load model preferences only - removed system instruction loading
  useEffect(() => {
    const savedModel = localStorage.getItem('openai_model') || process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4';
  }, []);

  // Content type presets
  const contentPresets = [
    { id: 'latest-news', label: 'News', icon: '📰' },
    { id: 'motivation', label: 'Motivation', icon: '💪' },
    { id: 'info', label: 'Information', icon: 'ℹ️' },
    { id: 'vibe-check', label: 'Vibe Check', icon: '😎' },
    { id: 'surprise-me', label: 'Surprise Me', icon: '🎁' }
  ];

  // Platform options
  const platformOptions = [
    { id: 'twitter', label: 'Twitter', icon: '🐦' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'blog', label: 'Blog', icon: '📝' }
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderSidebar = () => {
    return (
      <div className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'} ${theme === 'dark' ? 'dark' : 'light'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">✍️</span>
            <h1>Writer Pro</h1>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <button 
              className={currentView === 'home' ? 'nav-item active' : 'nav-item'} 
              onClick={() => {
                setCurrentView('home');
                resetWorkflow();
              }}>
              <span className="nav-icon">📝</span>
              <span className="nav-label">Write</span>
            </button>
            <button 
              className={currentView === 'config' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setCurrentView('config')}>
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </button>
          </nav>
          
          <ThemeSwitcher />
          
          {currentView === 'home' && (
            <div className="workflow-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${(currentStep / 5) * 100}%`}}
                ></div>
              </div>
              <div className="step-labels">
                <span className={currentStep >= 1 ? 'active' : ''}>Describe</span>
                <span className={currentStep >= 3 ? 'active' : ''}>Platform</span>
                <span className={currentStep >= 5 ? 'active' : ''}>Publish</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Home view render function (with all steps)
  const renderHomeView = () => {
    return (
      <div className="home-view">
        {currentStep === 1 && (
          <div className="content-card">
            <h2>What do you want to create?</h2>
            
            <div className="content-description">
              <textarea 
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
                placeholder="Describe what you want to write about..."
                className="content-textarea"
              />
            </div>
            
            <div className="content-presets">
              <h3>Quick templates:</h3>
              <div className="preset-grid">
                {contentPresets.map(preset => (
                  <button 
                    key={preset.id}
                    className={contentType === preset.id ? 'preset-card active' : 'preset-card'}
                    onClick={() => handleContentPresetClick(preset)}
                  >
                    <div className="preset-icon">{preset.icon}</div>
                    <div className="preset-label">{preset.label}</div>
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
                {isGenerating ? 'Generating...' : 'Generate Outline'} {isGenerating && <span className="loading-spinner"></span>}
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="content-card">
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
              <h3>Select platform</h3>
              <div className="platform-grid">
                {platformOptions.map(platform => (
                  <button 
                    key={platform.id}
                    className="platform-card"
                    onClick={() => selectPlatform(platform.id)}
                  >
                    <div className="platform-icon">{platform.icon}</div>
                    <div className="platform-name">{platform.label}</div>
                  </button>
                ))}
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
          <div className="content-card">
            <h2>Optimize for {currentPlatform}</h2>
            
            <div className="action-container">
              <button className="action-button secondary" onClick={() => setCurrentStep(2)}>
                Back
              </button>
              <button 
                className="action-button primary" 
                onClick={optimizeForPlatform}
                disabled={isGenerating}
              >
                {isGenerating ? 'Optimizing...' : 'Optimize'} {isGenerating && <span className="loading-spinner"></span>}
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 4 && (
          <div className="content-card">
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
                Continue
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 5 && (
          <div className="content-card">
            <h2>Publish to {currentPlatform}</h2>
            
            <div className="preview-container">
              <h3>Preview</h3>
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
              <div className="toggle-switch">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isScheduling}
                    onChange={handleScheduleToggle}
                  />
                  <span className="slider round"></span>
                </label>
                <span>Schedule for later</span>
              </div>
              
              {isScheduling && (
                <div className="schedule-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input 
                        type="date" 
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="date-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input 
                        type="time" 
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="time-input"
                      />
                    </div>
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
                  {isScheduling ? 'Schedule' : 'Post Now'}
                </button>
              </div>
            </div>
          </div>
        )}
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
        return renderHomeView();
    }
  };

  return (
    <div className={`App ${theme}`}>
      {renderSidebar()}
      
      <div className={`app-main ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
        <div className="content-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
