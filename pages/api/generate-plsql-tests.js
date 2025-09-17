// Next.js API route for PL/SQL test generation
// This endpoint handles the server-side OpenAI API calls

import fs from 'fs';
import path from 'path';

// Helper function to read file content
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      code, 
      framework = 'utPLSQL', 
      includeSetup = true, 
      includeErrorHandling = true, 
      testComplexity = 'comprehensive'
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
        error: 'OpenAI API key not configured on server',
        success: false 
      });
    }

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
    prompt_messages.push({"role": "user", "content": `Generate a comprehensive PLSQL unit test suite for the following code:\n\n\`\`\`sql\n${code}\n\`\`\`\n\nThe tests should cover different scenarios, including edge cases and error handling, based on the provided knowledge and examples.`});

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: prompt_messages,
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API Error:', response.status, errorData);
      
      return res.status(response.status).json({ 
        error: `OpenAI API Error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`,
        success: false 
      });
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ 
        error: 'No response generated from OpenAI API',
        success: false 
      });
    }

    const generatedTests = data.choices[0].message.content;

    // Generate a unique token for tracking
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const token = `PLSQL-${timestamp}-${random}`.toUpperCase();

    // Return successful response
    return res.status(200).json({
      success: true,
      tests: generatedTests,
      framework: framework,
      model: 'gpt-4o-mini',
      token: token,
      usage: data.usage,
      metadata: {
          timestamp: new Date().toISOString(),
          codeLength: code.length,
          options: {
            framework,
            includeSetup,
            includeErrorHandling,
            testComplexity
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
