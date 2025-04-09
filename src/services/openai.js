/**
 * OpenAI Service (Frontend)
 * Handles communication with the FastAPI backend for AI tasks.
 */

// Base URL for the FastAPI backend
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

// Platform character limits (kept here for frontend UI display)
export const PLATFORM_LIMITS = {
  twitter: parseInt(process.env.REACT_APP_TWITTER_LIMIT) || 280,
  linkedin: parseInt(process.env.REACT_APP_LINKEDIN_LIMIT) || 3000,
  instagram: parseInt(process.env.REACT_APP_INSTAGRAM_LIMIT) || 2200,
  blog: parseInt(process.env.REACT_APP_BLOG_LIMIT) || 10000,
  default: 5000
};

/**
 * Helper function to make POST requests to the backend
 */
async function postToBackend(endpoint, body) {
  // Print request data for debugging
  console.log(`[DEBUG] Sending request to ${endpoint}:`, body);
  
  try {
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Print response data
    console.log(`[DEBUG] Response from ${endpoint}:`, data);

    if (!response.ok) {
      // Use the detail message from FastAPI's HTTPException if available
      const errorDetail = data.detail || `Backend request failed with status ${response.status}`;
      console.error('Backend Error:', errorDetail);
      throw new Error(errorDetail);
    }

    return data;
  } catch (error) {
    console.error(`Error calling backend endpoint ${endpoint}:`, error);
    // Re-throw the error so calling components can handle it (e.g., show message to user)
    throw error;
  }
}

/**
 * Generate an outline by calling the backend endpoint
 * 
 * @param {string} contentDescription - User's content description
 * @param {string} contentType - Type of content (latest-news, motivation, etc.)
 * @param {string} configPageInstruction - The system instruction from ConfigPage
 * @returns {Promise<string>} - Generated outline
 */
export const generateOutline = async (contentDescription, contentType, configPageInstruction) => {
  const body = { 
    contentDescription, 
    contentType,
    base_system_instruction: configPageInstruction, // ConfigPage instruction renamed for backend
    customSystemInstruction: "" // Kept for backend compatibility
  };
  const data = await postToBackend('/generate-outline', body);
  return data.outline; // Assuming backend returns { "outline": "..." }
};

/**
 * Optimize content by calling the backend endpoint
 * 
 * @param {string} content - The content to optimize
 * @param {string} platform - The platform to optimize for (twitter, linkedin, etc.)
 * @param {string} contentType - Type of content
 * @param {string} configPageInstruction - The system instruction from ConfigPage
 * @returns {Promise<string>} - Optimized content
 */
export const optimizeForPlatform = async (content, platform, contentType, configPageInstruction) => {
  const body = { 
    content, 
    platform, 
    contentType,
    base_system_instruction: configPageInstruction, // ConfigPage instruction renamed for backend
    customSystemInstruction: "" // Kept for backend compatibility
  };
  const data = await postToBackend('/optimize-content', body);
  return data.optimizedContent; // Assuming backend returns { "optimizedContent": "..." }
};

// Export necessary functions and constants
export default {
  generateOutline,
  optimizeForPlatform,
  PLATFORM_LIMITS
}; 