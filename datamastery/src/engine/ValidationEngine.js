import { genericValidators } from './validators/genericValidators.js';

/**
 * ValidationEngine — Reusable semantic validation engine.
 * Decouples Pyodide execution output validation from React UI and validator files.
 */
class ValidationEngineClass {
  constructor() {
    this.validators = { ...genericValidators };
  }

  /**
   * Register a module of validator functions.
   *
   * @param {object} validatorModule - Object mapping validator names to functions
   */
  registerValidators(validatorModule) {
    this.validators = {
      ...this.validators,
      ...validatorModule,
    };
  }

  /**
   * Run a semantic validation check against python execution results.
   *
   * @param {string} validatorName - Name of the registered validation function
   * @param {object} executionResult - Pyodide stdout, stderr, variables, and error
   *   { stdout, stderr, variables, error }
   * @param {object} context - Context containing additional configuration or state
   *   { type: 'guided' | 'challenge', currentState?: string }
   * @returns {object} Standard validation result
   *   {
   *     passed: boolean,
   *     feedback: string,
   *     reachedStates?: string[],
   *     currentState?: string,
   *     nextState?: string,
   *     templateVars?: object
   *   }
   */
  validate(validatorName, executionResult, context = {}) {
    const validatorFn = this.validators[validatorName];

    if (!validatorFn) {
      console.warn(`ValidationEngine: Validator "${validatorName}" not found.`);
      return {
        passed: false,
        feedback: "Internal Error: Validator configuration missing.",
      };
    }

    try {
      // Execute the registered validator function.
      // Reusable validators inspect stdout and python variables semantic state.
      const result = validatorFn(executionResult, context);

      // Normalize result shape
      return {
        passed: !!result.passed,
        feedback: result.feedback || "",
        reachedStates: result.reachedStates || [],
        currentState: result.currentState || null,
        nextState: result.nextState || null,
        templateVars: result.templateVars || {},
      };
    } catch (e) {
      console.error(`ValidationEngine: Error running validator "${validatorName}":`, e);
      return {
        passed: false,
        feedback: "There was an error checking your solution. Please double check your code syntax.",
      };
    }
  }
}

export const ValidationEngine = new ValidationEngineClass();
export default ValidationEngine;
