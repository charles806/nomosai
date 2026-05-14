export const API_CONFIG = {
  // Switched to Gemini 2.5 Flash for higher stability and better free-tier quota
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
};