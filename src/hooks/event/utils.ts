import type { TemplateString } from './type';

export function parseTemplate(
  template: TemplateString,
  content: Record<string, any>,
  stepContext?: Record<string, any>
): any {
  const match = template.match(/^{{(.*?)}}$/);
  if (!match) return template;

  const expression = match[1];
  const { outputVar, ...rest } = content;
  const sandbox = { ...rest, ...outputVar, ...stepContext };

  const whitelist = new Set(Object.keys(sandbox));
  // 简单静态检查：找出表达式中的标识符并检查是否都在白名单中
  const unknownIdentifiers = Array.from(
    new Set(expression.replace(/(["'])((?:\\.|(?!\1).)*?)\1/g, '').match(/[.$]?\b[A-Za-z_][A-Za-z0-9_-]*/g) || [])
  )
    .filter((i) => i[0] !== '.')
    .filter((i) => !whitelist.has(i));
  if (unknownIdentifiers.length > 0) {
    console.warn('表达式中包含未知标识符:', unknownIdentifiers);
    return '';
  }

  try {
    const func = new Function(
      ...Object.keys(sandbox),
      `
      'use strict';
      return (${expression});
    `
    );
    return func(...Object.values(sandbox));
  } catch (err) {
    console.warn('模板解析失败:', expression, err);
    return '';
  }
}

export function getIdByTemplate(template: TemplateString): string {
  const match = template.match(/\$(?:val)?\('(.*?)'\)/);
  if (!match) return '';
  return match[1];
}
