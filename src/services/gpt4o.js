/**
 * GPT-4o API service
 * Specialized service for OpenAI's latest GPT-4o model with enhanced capabilities
 */

import OpenAIService from './openai';

// Get the API key, preferring environment variable, then localStorage
const getApiKey = () => {
  return process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '';
};

// Get the system instruction
const getSystemInstruction = () => {
  return OpenAIService.getSystemInstruction();
};

/**
 * Generate content using GPT-4o with enhanced parameters
 * 
 * @param {string} prompt - User message/prompt to send to the model
 * @param {string} systemPrompt - System instructions for the model
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The generated content
 */
export const generateContentWithGPT4o = async (prompt, systemPrompt = null, options = {}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it in the configuration settings or .env file.');
  }
  
  // If no specific system prompt is provided, use the configured one
  const finalSystemPrompt = systemPrompt || getSystemInstruction();
  
  const {
    temperature = 1,
    maxTokens = 2048,
    topP = 1
  } = options;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        top_p: topP
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
    console.error('Error calling GPT-4o API:', error);
    throw error;
  }
};

/**
 * Generate content for a specific platform using GPT-4o
 * This is a specialized version that produces high-quality, platform-optimized content
 * 
 * @param {string} contentDescription - User's content description/topic
 * @param {string} platform - Target platform (twitter, linkedin, etc.)
 * @param {string} contentType - Type of content (latest-news, motivation, etc.)
 * @returns {Promise<string>} - Platform-optimized content
 */
export const generatePlatformContent = async (contentDescription, platform, contentType) => {
  // Create a prompt that will generate great content for the specific platform
  const platformInfo = {
    twitter: {
      charLimit: OpenAIService.PLATFORM_LIMITS.twitter,
      features: 'hashtags, brevity, and engaging calls to action'
    },
    linkedin: {
      charLimit: OpenAIService.PLATFORM_LIMITS.linkedin,
      features: 'professional tone, industry insights, and thought leadership'
    },
    instagram: {
      charLimit: OpenAIService.PLATFORM_LIMITS.instagram,
      features: 'visual descriptions, emojis, and strategic hashtag groups'
    },
    blog: {
      charLimit: OpenAIService.PLATFORM_LIMITS.blog,
      features: 'comprehensive information, clear structure, and SEO optimization'
    }
  };
  
  const platform_data = platformInfo[platform] || { charLimit: 1000, features: 'clear and engaging content' };
  
  // Create a prompt for the AI
  let prompt = `Create a ${contentType || 'engaging'} post about: ${contentDescription}`;
  prompt += `\nThis is for ${platform} and should be optimized with ${platform_data.features}.`;
  prompt += `\nKeep it under ${platform_data.charLimit} characters if possible.`;
  
  // Add specific instructions based on content type
  switch(contentType) {
    case 'latest-news':
      prompt += '\nFormat as breaking news with key points and impacts.';
      break;
    case 'motivation':
      prompt += '\nInclude an inspirational message and a clear call to action.';
      break;
    case 'info':
      prompt += '\nProvide valuable information in an educational, easy-to-understand format.';
      break;
    case 'vibe-check':
      prompt += '\nKeep it casual and conversational, with audience engagement prompts.';
      break;
    case 'surprise-me':
      prompt += '\nBe creative, unexpected, and thought-provoking.';
      break;
    default:
      break;
  }
  
  // System prompt for the content writer - combine with user's custom instruction
  const baseSystemPrompt = `You are a professional content writer specializing in creating engaging content for ${platform}. 
Your task is to produce well-written, platform-optimized content that follows best practices for ${platform}.
You should write directly in the voice of the user without any meta commentary or explanations.`;

  // Get the user's custom system instruction and combine it with our base prompt
  const userSystemInstruction = getSystemInstruction();
  const finalSystemPrompt = `${userSystemInstruction}\n\n${baseSystemPrompt}`;
  
  // Call the API
  return generateContentWithGPT4o(prompt, finalSystemPrompt);
};

export default {
  generateContentWithGPT4o,
  generatePlatformContent
}; 