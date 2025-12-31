import Handlebars from 'handlebars';

Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('ne', (a, b) => a !== b);
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('gte', (a, b) => a >= b);
Handlebars.registerHelper('lt', (a, b) => a < b);
Handlebars.registerHelper('lte', (a, b) => a <= b);
Handlebars.registerHelper('and', (a, b) => a && b);
Handlebars.registerHelper('or', (a, b) => a || b);
Handlebars.registerHelper('not', (a) => !a);

Handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString();
  }
  if (format === 'long') {
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return d.toISOString();
});

Handlebars.registerHelper('formatCurrency', (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
});

Handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase());
Handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase());
Handlebars.registerHelper('capitalize', (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('truncate', (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
});

Handlebars.registerHelper('default', (value, defaultValue) => value ?? defaultValue);

Handlebars.registerHelper('json', (obj) => JSON.stringify(obj));

const VARIABLE_REGEX = /\{\{([^#/!>][^}]*?)\}\}/g;

export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  let match;

  while ((match = VARIABLE_REGEX.exec(template)) !== null) {
    const variable = match[1].trim().split(' ')[0];
    if (!variable.startsWith('else') && !variable.startsWith('this')) {
      variables.add(variable);
    }
  }

  return Array.from(variables);
}

export function compileTemplate(template: string): HandlebarsTemplateDelegate {
  return Handlebars.compile(template);
}

export function renderTemplate(template: string, variables: Record<string, unknown>): string {
  const compiled = compileTemplate(template);
  return compiled(variables);
}

export { Handlebars };
