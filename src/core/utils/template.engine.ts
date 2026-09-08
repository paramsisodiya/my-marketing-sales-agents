/**
 * Template Engine & Variable Interpolation Utility for PrimeSoul AI
 * Handles secure substitution of lead, workflow, and agent context variables.
 */

export class TemplateEngine {
  private static readonly VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_.]+)(?:\s*\|\s*([^}]+))?\s*\}\}/g;

  /**
   * Interpolates a string template with variables from context and lead data.
   */
  public static interpolate(template: string, variables: Record<string, any> = {}): string {
    if (!template || typeof template !== 'string') return '';
    if (!variables || typeof variables !== 'object') return template;

    // Build a normalized lookup map supporting camelCase, snake_case, and lower_case
    const lookupMap = this.buildNormalizedLookupMap(variables);

    return template.replace(this.VARIABLE_REGEX, (match, rawKey, fallback) => {
      const key = rawKey.trim();
      const value = this.resolveValue(key, lookupMap, variables);

      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value);
      }

      if (fallback !== undefined) {
        return fallback.trim();
      }

      // Return default placeholder or keep original token if not resolved
      return match;
    });
  }

  /**
   * Recursively interpolates all string fields within an object, array, or primitive.
   */
  public static interpolateObject<T>(target: T, variables: Record<string, any>): T {
    if (target === null || target === undefined) return target;

    if (typeof target === 'string') {
      return this.interpolate(target, variables) as unknown as T;
    }

    if (Array.isArray(target)) {
      return target.map(item => this.interpolateObject(item, variables)) as unknown as T;
    }

    if (typeof target === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(target)) {
        result[key] = this.interpolateObject(value, variables);
      }
      return result as T;
    }

    return target;
  }

  /**
   * Validates that all required variables are present and non-empty in the provided context.
   * Throws a descriptive Error if any required variable is missing.
   */
  public static validateRequiredVariables(
    requiredKeys: string[],
    context: Record<string, any>,
    sourceIdentifier: string = 'Workflow Step'
  ): { valid: boolean; missing: string[] } {
    const lookup = this.buildNormalizedLookupMap(context);
    const missing: string[] = [];

    for (const reqKey of requiredKeys) {
      const val = this.resolveValue(reqKey, lookup, context);
      if (val === undefined || val === null || val === '') {
        missing.push(reqKey);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `[VariableValidationError] ${sourceIdentifier} requires variable(s) [${missing.join(', ')}], but they were missing or empty in the provided context.`
      );
    }

    return { valid: true, missing: [] };
  }

  /**
   * Extracts all variable keys referenced inside a template string.
   */
  public static extractVariables(template: string): string[] {
    if (!template || typeof template !== 'string') return [];
    const keys: Set<string> = new Set();
    let match: RegExpExecArray | null;
    const regex = new RegExp(this.VARIABLE_REGEX.source, 'g');

    while ((match = regex.exec(template)) !== null) {
      keys.add(match[1].trim());
    }

    return Array.from(keys);
  }

  private static resolveValue(key: string, lookupMap: Map<string, any>, rawObj: Record<string, any>): any {
    // 1. Direct key match in normalized map
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lookupMap.has(normalizedKey)) {
      return lookupMap.get(normalizedKey);
    }

    // 2. Nested dot path lookup (e.g. lead.businessName)
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: any = rawObj;
      for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return undefined;
        }
        current = current[part];
      }
      return current;
    }

    return undefined;
  }

  private static buildNormalizedLookupMap(source: Record<string, any>): Map<string, any> {
    const map = new Map<string, any>();

    const flatten = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;

      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        map.set(normalized, v);

        // Also add aliases for common field names
        if (normalized === 'businessname' || normalized === 'companyname' || normalized === 'company') {
          map.set('businessname', v);
          map.set('companyname', v);
          map.set('company', v);
        }
        if (normalized === 'contactname' || normalized === 'fullname' || normalized === 'name' || normalized === 'leadname') {
          map.set('contactname', v);
          map.set('contact', v);
          map.set('fullname', v);
          map.set('name', v);
        }
        if (normalized === 'website' || normalized === 'site' || normalized === 'url' || normalized === 'websiteurl') {
          map.set('website', v);
          map.set('url', v);
          map.set('websiteurl', v);
        }
        if (normalized === 'industry' || normalized === 'niche' || normalized === 'sector') {
          map.set('industry', v);
          map.set('niche', v);
        }
        if (normalized === 'location' || normalized === 'city' || normalized === 'geo') {
          map.set('location', v);
          map.set('city', v);
        }

        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          flatten(v, fullKey);
        }
      }
    };

    flatten(source);
    return map;
  }
}
