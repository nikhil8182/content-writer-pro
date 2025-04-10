import './App.css';
import Editor from './components/Editor';
import ConfigPage from './components/ConfigPage';
import ThemeSwitcher from './components/ThemeSwitcher';
import CharCounterTest from './components/CharCounterTest';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTest, setShowTest] = useState(false);

  // Load model preferences only
  useEffect(() => {
    const savedModel = localStorage.getItem('openai_model') || process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4';
  }, []);

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalContent)
      .then(() => {
        setCopySuccess(true);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setContentDescription('');
    setContentType('');
    setGeneratedOutline('');
    setFinalContent('');
    setCurrentPlatform('');
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
                setShowTest(false);
              }}>
              <span className="nav-icon">📝</span>
              <span className="nav-label">Write</span>
            </button>
            <button 
              className={currentView === 'config' ? 'nav-item active' : 'nav-item'} 
              onClick={() => {
                setCurrentView('config');
                setShowTest(false);
              }}>
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </button>
            <button 
              className={showTest ? 'nav-item active' : 'nav-item'} 
              onClick={() => {
                setShowTest(true);
                setCurrentView('');
              }}>
              <span className="nav-icon">📊</span>
              <span className="nav-label">Test Counter</span>
            </button>
          </nav>
          
          <ThemeSwitcher />
          
          {currentView === 'home' && !showTest && (
            <div className="workflow-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${(currentStep / 3) * 100}%`}}
                ></div>
              </div>
              <div className="step-labels">
                <span className={currentStep >= 1 ? 'active' : ''}>Describe</span>
                <span className={currentStep >= 2 ? 'active' : ''}>Outline</span>
                <span className={currentStep >= 3 ? 'active' : ''}>Edit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Home view render function (with streamlined steps)
  const renderHomeView = () => {
    return (
      <div className="home-view">
        {currentStep === 1 && (
          <div className="content-card">
            <div className="step-indicator">
              <div className="step-number">1</div>
              <div className="step-label">Step 1 of 3: Describe Your Content</div>
            </div>
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
            <div className="step-indicator">
              <div className="step-number">2</div>
              <div className="step-label">Step 2 of 3: Choose Platform & Review Outline</div>
            </div>
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
            <div className="step-indicator">
              <div className="step-number">3</div>
              <div className="step-label">Step 3 of 3: Edit & Copy Content</div>
            </div>
            <h2>Optimize for {currentPlatform}</h2>
            {apiKeyError && <div className="api-error-message">{apiKeyError}</div>}
            
            <Editor 
              platform={currentPlatform} 
              contentDescription={contentDescription}
              contentType={contentType}
              initialOutline={generatedOutline}
              onContentChange={(newContent) => setFinalContent(newContent)}
            />
            
            <div className="preview-container">
              <h3>Final Content Preview</h3>
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
            
            <div className="action-container">
              <button className="action-button secondary" onClick={() => setCurrentStep(2)}>
                Back
              </button>
              <button 
                className="action-button primary"
                onClick={copyToClipboard}
                disabled={!finalContent}
              >
                {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button 
                className="action-button secondary"
                onClick={resetWorkflow}
              >
                Create New Content
              </button>
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
    if (showTest) {
      return <CharCounterTest />;
    }
    
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
