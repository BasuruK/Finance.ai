// Next.js API route for PL/SQL test generation
// This endpoint handles the server-side OpenAI API calls with support for pretrained models

import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Configuration for pretrained model
const PRETRAINED_PROMPT_ID = "pmpt_689049a4f79c81969c9a616f70629b43039cb2b0b7fae1a4";
const PRETRAINED_PROMPT_VERSION = "1";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Read a text file synchronously and return its UTF-8 contents.
 *
 * Returns the file content as a string, or null if the file could not be read (e.g., missing file or permission error).
 * @param {string} filePath - Path to the file to read.
 * @return {string|null} The file contents, or null on read failure.
 */
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Next.js API route handler that generates PL/SQL unit tests from provided PL/SQL code.
 *
 * Processes POST requests with a JSON body:
 *  - code (string, required): the PL/SQL source to generate tests for.
 *  - usePretrainedModel (boolean, optional, default true): whether to attempt a pretrained prompt first.
 *
 * Behavior:
 *  - Applies restricted CORS based on ALLOWED_ORIGINS environment variable (no wildcard when not configured).
 *  - Responds to preflight OPTIONS requests (204 when origin allowed; 403 if origin is explicitly disallowed).
 *  - Validates input and server OpenAI API key.
 *  - Attempts to generate tests using a pretrained prompt (PRETRAINED_PROMPT_ID / PRETRAINED_PROMPT_VERSION); on failure falls back to a chat-based model (gpt-4o-mini) that may incorporate resources/knowledge_base.txt and resources/examples.sql if present.
 *  - Returns JSON with keys: success, tests, framework ('PLSQL'), model, token, usage, and metadata (timestamp, codeLength, options).
 *
 * HTTP status codes produced (examples):
 *  - 200: success with generated tests.
 *  - 204: successful preflight validation.
 *  - 400: invalid or missing `code`.
 *  - 403: preflight origin not allowed.
 *  - 405: method not allowed (only POST accepted).
 *  - 500: server configuration error (missing API key) or other internal errors.
 */
export default async function handler(req, res) {
  // Restricted CORS handling
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const requestOrigin = req.headers.origin;
  // If no origins configured, default to same-origin only (do not set wildcard)
  if (requestOrigin && allowedOrigins.length > 0 && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else if (allowedOrigins.length === 0) {
    // Default to same-origin only when not configured
    // Do not set Access-Control-Allow-Origin header
  }  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');

  // Handle preflight OPTIONS request early
  if (req.method === 'OPTIONS') {
    // If origin not allowed, respond without permissive headers
    if (requestOrigin && allowedOrigins.length > 0 && !allowedOrigins.includes(requestOrigin)) {
      return res.status(403).end();
    }
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      code, 
      usePretrainedModel = true  // New parameter to toggle pretrained model
    } = req.body;

    // Validate input
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ 
        error: 'PL/SQL code is required and must be a non-empty string',
        success: false 
      });
    }

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        success: false 
      });
    }

    let generatedTests;
    let modelUsed = 'gpt-4o-mini';
    let usage = null;

    try {
      if (usePretrainedModel) {
        // Try using the pretrained model first
        console.log('Using pretrained model with prompt ID:', PRETRAINED_PROMPT_ID);
        
        const response = await openai.responses.create({
          prompt: {
            id: PRETRAINED_PROMPT_ID,
            version: PRETRAINED_PROMPT_VERSION
          },
          input: [code], // Pass the PL/SQL code as input
          text: {
            format: {
              type: "text"
            }
          },
          reasoning: {},
          max_output_tokens: 2048,
          store: false
        });

        generatedTests = response.choices[0].message.content;
        modelUsed = 'pretrained-model';
        usage = response.usage;

      } else {
        throw new Error('Using standard model as requested');
      }
    } catch (pretrainedError) {
      console.log('Pretrained model failed, falling back to standard model:', pretrainedError.message);
      
      // Fallback to standard model
      // Read knowledge base and examples from actual files
      const resourcesPath = path.join(process.cwd(), 'resources');
      const knowledgeBase = readFileContent(path.join(resourcesPath, 'knowledge_base.txt'));
      const examples = readFileContent(path.join(resourcesPath, 'examples.sql'));

      // Construct the prompt for the AI (following Python structure exactly)
      const prompt_messages = [
        {"role": "system", "content": "You are an AI assistant specialized in generating PLSQL unit tests."}
      ];

      // Add knowledge base if it exists
      if (knowledgeBase) {
        prompt_messages.push({"role": "user", "content": `Here is some relevant knowledge about PLSQL standards and practices:\n\n${knowledgeBase}`});
      }

      // Add examples if they exist  
      if (examples) {
        prompt_messages.push({"role": "user", "content": `Here are some examples of PLSQL unit tests:\n\n${examples}`});
      }

      // Add the main prompt with the code to test
      prompt_messages.push({"role": "user", "content": `Generate a comprehensive PLSQL unit test suite for the following code:\n\n\`\`\`sql\n${code}\n\`\`\`\n\nThe tests should cover different scenarios, including edge cases and error handling, based on the provided knowledge and examples and dont forget to use the table structure when generating the test scenarios and give exact one unit test block.`});

      // Call standard OpenAI API
      const standardResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: prompt_messages,
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      generatedTests = standardResponse.choices[0].message.content;
      modelUsed = 'gpt-4o-mini';
      usage = standardResponse.usage;
    }

    // Generate a unique token for tracking
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const token = `PLSQL-${timestamp}-${random}`.toUpperCase();

    // Return successful response
    return res.status(200).json({
      success: true,
      tests: generatedTests,
      framework: 'PLSQL',
      model: modelUsed,
      token: token,
      usage: usage,
      metadata: {
          timestamp: new Date().toISOString(),
          codeLength: code.length,
          options: {
            usePretrainedModel
          }
        }
    });

  } catch (error) {
    console.error('Error in PL/SQL test generation:', error);
    
    return res.status(500).json({ 
      error: `Server error: ${error.message}`,
      success: false 
    });
  }
}
