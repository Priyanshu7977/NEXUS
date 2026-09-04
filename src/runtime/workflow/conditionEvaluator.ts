import { getNestedValue, resolveVariables } from './variableResolver';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'exists'
  | 'is_true'
  | 'is_false';

export interface ConditionRule {
  left: string; // e.g. '{{node_1.output.score}}' or 'node_1.output.score'
  operator: ConditionOperator;
  right?: any;
}

/**
 * Safely evaluates a single condition rule against workflow context without eval().
 */
export const evaluateConditionRule = (
  rule: ConditionRule,
  context: Record<string, any>
): boolean => {
  let leftVal: any;

  if (typeof rule.left === 'string') {
    if (rule.left.startsWith('{{') && rule.left.endsWith('}}')) {
      leftVal = resolveVariables(rule.left, context);
    } else {
      leftVal = getNestedValue(context, rule.left);
      if (leftVal === undefined) {
        leftVal = resolveVariables(rule.left, context);
      }
    }
  } else {
    leftVal = rule.left;
  }

  const rightVal = typeof rule.right === 'string' ? resolveVariables(rule.right, context) : rule.right;

  switch (rule.operator) {
    case 'equals':
      return String(leftVal).trim() === String(rightVal).trim();

    case 'not_equals':
      return String(leftVal).trim() !== String(rightVal).trim();

    case 'contains':
      if (typeof leftVal === 'string') {
        return leftVal.includes(String(rightVal));
      }
      if (Array.isArray(leftVal)) {
        return leftVal.some((item) => String(item) === String(rightVal));
      }
      return false;

    case 'not_contains':
      if (typeof leftVal === 'string') {
        return !leftVal.includes(String(rightVal));
      }
      if (Array.isArray(leftVal)) {
        return !leftVal.some((item) => String(item) === String(rightVal));
      }
      return true;

    case 'greater_than': {
      const lNum = Number(leftVal);
      const rNum = Number(rightVal);
      return !isNaN(lNum) && !isNaN(rNum) && lNum > rNum;
    }

    case 'less_than': {
      const lNum = Number(leftVal);
      const rNum = Number(rightVal);
      return !isNaN(lNum) && !isNaN(rNum) && lNum < rNum;
    }

    case 'greater_than_or_equal': {
      const lNum = Number(leftVal);
      const rNum = Number(rightVal);
      return !isNaN(lNum) && !isNaN(rNum) && lNum >= rNum;
    }

    case 'less_than_or_equal': {
      const lNum = Number(leftVal);
      const rNum = Number(rightVal);
      return !isNaN(lNum) && !isNaN(rNum) && lNum <= rNum;
    }

    case 'is_empty':
      if (leftVal === null || leftVal === undefined) return true;
      if (typeof leftVal === 'string') return leftVal.trim().length === 0;
      if (Array.isArray(leftVal)) return leftVal.length === 0;
      if (typeof leftVal === 'object') return Object.keys(leftVal).length === 0;
      return false;

    case 'is_not_empty':
      if (leftVal === null || leftVal === undefined) return false;
      if (typeof leftVal === 'string') return leftVal.trim().length > 0;
      if (Array.isArray(leftVal)) return leftVal.length > 0;
      if (typeof leftVal === 'object') return Object.keys(leftVal).length > 0;
      return true;

    case 'exists':
      return leftVal !== null && leftVal !== undefined;

    case 'is_true':
      return leftVal === true || leftVal === 'true' || leftVal === 1 || leftVal === '1';

    case 'is_false':
      return leftVal === false || leftVal === 'false' || leftVal === 0 || leftVal === '0';

    default:
      return false;
  }
};

/**
 * Parses simple string expressions like "score > 80" or "status == 'passed'"
 */
export const parseAndEvaluateExpression = (
  expr: string,
  context: Record<string, any>
): boolean => {
  if (!expr || typeof expr !== 'string' || expr.trim() === '') {
    return true; // Empty condition evaluates to true
  }

  const trimmed = expr.trim();

  // Check simple keywords
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Comparison patterns: ==, !=, >=, <=, >, <, contains
  const patterns: { regex: RegExp; op: ConditionOperator }[] = [
    { regex: /^(.+?)\s*(?:===|==)\s*(.+)$/, op: 'equals' },
    { regex: /^(.+?)\s*(?:!==|!=)\s*(.+)$/, op: 'not_equals' },
    { regex: /^(.+?)\s*>=\s*(.+)$/, op: 'greater_than_or_equal' },
    { regex: /^(.+?)\s*<=\s*(.+)$/, op: 'less_than_or_equal' },
    { regex: /^(.+?)\s*>\s*(.+)$/, op: 'greater_than' },
    { regex: /^(.+?)\s*<\s*(.+)$/, op: 'less_than' },
    { regex: /^(.+?)\s+contains\s+(.+)$/i, op: 'contains' },
  ];

  for (const { regex, op } of patterns) {
    const match = trimmed.match(regex);
    if (match) {
      const rawLeft = match[1].trim();
      let rawRight = match[2].trim();

      // Strip quotes if any
      if ((rawRight.startsWith("'") && rawRight.endsWith("'")) || (rawRight.startsWith('"') && rawRight.endsWith('"'))) {
        rawRight = rawRight.substring(1, rawRight.length - 1);
      }

      return evaluateConditionRule(
        {
          left: rawLeft,
          operator: op,
          right: rawRight,
        },
        context
      );
    }
  }

  // Fallback: evaluate truthiness of field
  const val = getNestedValue(context, trimmed) ?? resolveVariables(trimmed, context);
  return Boolean(val && val !== 'false' && val !== '0');
};
