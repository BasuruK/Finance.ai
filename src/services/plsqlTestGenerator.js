// PL/SQL Test Generator Service
// Converts the Python functionality to JavaScript for Finance.ai

class PLSQLTestGenerator {
  constructor() {
    this.modelName = 'gpt-4o-mini';
    this.apiEndpoint = '/api/generate-plsql-tests';
  }

  // Generate unit tests using Next.js API
  async generateTests(plsqlCode, options = {}) {
    const {
      framework = 'PLSQL',
      includeSetup = true,
      includeErrorHandling = true,
      testComplexity = 'comprehensive'
    } = options;

    if (!plsqlCode || plsqlCode.trim() === '') {
      throw new Error('PL/SQL code is required');
    }

    const payload = {
      code: plsqlCode,
      framework,
      includeSetup,
      includeErrorHandling,
      testComplexity
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate tests');
      }

      return {
        success: true,
        tests: data.tests,
        framework: data.framework,
        model: data.model,
        token: data.token,
        usage: data.usage,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('Error generating PL/SQL tests:', error);
      
      return {
        success: false,
        error: error.message,
        tests: null,
        framework: framework,
        model: this.modelName
      };
    }
  }

  // Validate PL/SQL code before processing
  validatePLSQLCode(code) {
    if (!code || typeof code !== 'string') {
      return { valid: false, error: 'Code must be a non-empty string' };
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) {
      return { valid: false, error: 'Code cannot be empty' };
    }

    // Basic PL/SQL syntax validation
    const plsqlKeywords = [
      'CREATE', 'PROCEDURE', 'FUNCTION', 'PACKAGE', 'TRIGGER',
      'BEGIN', 'END', 'DECLARE', 'AS', 'IS'
    ];

    const upperCode = trimmedCode.toUpperCase();
    const hasPlsqlKeywords = plsqlKeywords.some(keyword => upperCode.includes(keyword));

    if (!hasPlsqlKeywords) {
      return { 
        valid: false, 
        error: 'Code does not appear to contain valid PL/SQL syntax. Please include PL/SQL procedures, functions, or packages.' 
      };
    }

    return { valid: true };
  }

  // Generate token for tracking requests
  generateToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PLSQL-${timestamp}-${random}`.toUpperCase();
  }
}

export default PLSQLTestGenerator;
