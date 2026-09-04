/**
 * Safe Variable Resolver for NEXUS Workflow Engine.
 * Resolves template tags in the format {{path.to.variable}} against an execution context object.
 * No eval() or Function() constructor is used.
 */

export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  const parts = path.trim().split('.');
  let curr = obj;

  for (const part of parts) {
    if (curr === null || curr === undefined) {
      return undefined;
    }
    curr = curr[part];
  }

  return curr;
};

/**
 * Resolves all {{variable.path}} in a template string.
 * Example: "Reviewing repo {{trigger.repo}} with prompt: {{agent_1.output}}"
 */
export const resolveTemplateString = (template: string, context: Record<string, any>): string => {
  if (typeof template !== 'string') return String(template ?? '');

  const regex = /\{\{([\w.-]+)\}\}/g;
  return template.replace(regex, (_, path) => {
    const val = getNestedValue(context, path);
    if (val === undefined || val === null) {
      return '';
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  });
};

/**
 * Recursively resolves all template expressions inside an object, array, or primitive.
 */
export const resolveVariables = (target: any, context: Record<string, any>): any => {
  if (target === null || target === undefined) {
    return target;
  }

  if (typeof target === 'string') {
    // If the entire string is just a single {{variable.path}}, return raw object/type if available
    const singleMatch = target.trim().match(/^\{\{([\w.-]+)\}\}$/);
    if (singleMatch) {
      const val = getNestedValue(context, singleMatch[1]);
      return val !== undefined ? val : target;
    }
    return resolveTemplateString(target, context);
  }

  if (Array.isArray(target)) {
    return target.map((item) => resolveVariables(item, context));
  }

  if (typeof target === 'object') {
    const resolvedObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(target)) {
      resolvedObj[k] = resolveVariables(v, context);
    }
    return resolvedObj;
  }

  return target;
};
