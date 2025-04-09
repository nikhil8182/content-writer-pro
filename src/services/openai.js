/**
 * OpenAI API service
 * Handles all interactions with the OpenAI API
 */

// Platform character limits from environment variables or defaults
export const PLATFORM_LIMITS = {
  twitter: parseInt(process.env.REACT_APP_TWITTER_LIMIT) || 280,
  linkedin: parseInt(process.env.REACT_APP_LINKEDIN_LIMIT) || 3000,
  instagram: parseInt(process.env.REACT_APP_INSTAGRAM_LIMIT) || 2200,
  blog: parseInt(process.env.REACT_APP_BLOG_LIMIT) || 10000,
  default: 5000
};

// Default API key from environment variables
const DEFAULT_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
// Default model from environment variables
const DEFAULT_MODEL = process.env.REACT_APP_DEFAULT_AI_MODEL || 'gpt-4';
// Default system instruction
const DEFAULT_SYSTEM_INSTRUCTION = 'You are a professional content writer assistant.';

// Function to get the API key from local storage or env variable
const getApiKey = () => {
  return localStorage.getItem('openai_api_key') || DEFAULT_API_KEY;
};

// Function to set the API key in local storage
export const setApiKey = (key) => {
  localStorage.setItem('openai_api_key', key);
};

// Function to get the model preference from local storage or env variable
export const getModelPreference = () => {
  return localStorage.getItem('openai_model') || DEFAULT_MODEL;
};

// Function to set the model preference in local storage
export const setModelPreference = (model) => {
  localStorage.setItem('openai_model', model);
};

// Function to get the system instruction from local storage or default
export const getSystemInstruction = () => {
  return localStorage.getItem('system_instruction') || DEFAULT_SYSTEM_INSTRUCTION;
};

// Function to set the system instruction in local storage
export const setSystemInstruction = (instruction) => {
  localStorage.setItem('system_instruction', instruction);
};

/**
 * Generate content using the OpenAI API
 * 
 * @param {string} prompt - The prompt to send to the API
 * @param {object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated content
 */
export const generateContent = async (prompt, options = {}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it in the configuration settings.');
  }
  
  const {
    model = getModelPreference(),
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = getSystemInstruction()
  } = options;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`
      );
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

/**
 * Generate an outline based on content description
 * 
 * @param {string} contentDescription - User's content description
 * @param {string} contentType - Type of content (latest-news, motivation, etc.)
 * @returns {Promise<string>} - Generated outline in markdown format
 */
export const generateOutline = async (contentDescription, contentType) => {
  // Create a prompt based on the content description and type
  let basePrompt = '';
  
  if (contentType) {
    basePrompt = `Create a detailed content outline for a ${contentType} post with the following description: "${contentDescription}". `;
    
    // Add specific instructions based on content type
    switch(contentType) {
      case 'latest-news':
        basePrompt += 'Include sections for key points, background context, and why this matters. Add a section for impact analysis.';
        break;
      case 'motivation':
        basePrompt += 'Include an attention-grabbing opening, main motivational message with supporting points, and a clear call to action.';
        break;
      case 'info':
        basePrompt += 'Structure with an introduction, key information points, and practical application section.';
        break;
      case 'vibe-check':
        basePrompt += 'Keep it casual with a current mood section and conversation starters for audience engagement.';
        break;
      case 'surprise-me':
        basePrompt += 'Be creative and unexpected - include an attention-grabbing opening, unconventional main content, and a thought-provoking closing.';
        break;
      default:
        break;
    }
  } else {
    // If no content type is selected, use the free-form description
    basePrompt = `Create a detailed content outline based on the following description: "${contentDescription}". Include appropriate sections with bullet points for each section.`;
  }
  
  // Add formatting instructions
  basePrompt += ' Format the outline with Markdown headings (# for main title, ## for sections) and bullet points (- ) for list items.';
  
  // Set system prompt for outline generation
  const systemPrompt = 'You are a professional content writer who specializes in creating well-structured content outlines. Your outlines are clear, organized, and follow a logical flow.';
  
  try {
    return await generateContent(basePrompt, { systemPrompt });
  } catch (error) {
    // Log the error but don't throw, as we'll fall back to local generation
    console.error('Error generating outline with OpenAI:', error);
    throw error;
  }
};

/**
 * Optimize content for a specific platform
 * 
 * @param {string} content - The content to optimize
 * @param {string} platform - The platform to optimize for (twitter, linkedin, etc.)
 * @param {string} contentType - Type of content
 * @returns {Promise<string>} - Optimized content
 */
export const optimizeForPlatform = async (content, platform, contentType) => {
  const characterLimit = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.default;
  let prompt = `Optimize the following content for ${platform} with a character limit of ${characterLimit}:\n\n${content}\n\n`;
  
  // Add platform-specific instructions
  switch(platform) {
    case 'twitter':
      prompt += 'Optimize for Twitter by making it concise (under 280 characters if possible), adding relevant hashtags, and including a clear call to action.';
      break;
    case 'linkedin':
      prompt += 'Optimize for LinkedIn by using a professional tone, providing value and insights, and including a question to drive engagement.';
      break;
    case 'instagram':
      prompt += 'Optimize for Instagram by using visual language, strategic emojis, and grouping hashtags at the end.';
      break;
    case 'blog':
      prompt += 'Optimize for a blog by expanding the content with more details, using proper headings and structure, and optimizing for readability and SEO.';
      break;
    default:
      prompt += 'Optimize this content to be clear, engaging, and effective.';
  }
  
  // Set system prompt for platform optimization
  const systemPrompt = `You are a content optimization expert who specializes in creating content for ${platform}. You understand the best practices, character limits, and audience expectations for this platform.`;
  
  return generateContent(prompt, { systemPrompt });
};

// Export a default object with all functions
export default {
  generateOutline,
  optimizeForPlatform,
  setApiKey,
  getModelPreference,
  setModelPreference,
  getSystemInstruction,
  setSystemInstruction,
  PLATFORM_LIMITS
}; 