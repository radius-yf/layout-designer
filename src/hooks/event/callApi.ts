import { register } from './action';
import { parseTemplate } from './utils';
import allApi from './api';

declare module './type.ts' {
  interface AllAction {
    callApi: {
      // {{ $api.method(args) }}
      methodName: string;
      args: TemplateString[];
    };
  }
}

export const $api: Record<string, (...args: unknown[]) => unknown> = {};

Object.entries(allApi).forEach(([key, value]) => {
  $api[key] = value.fn;
});

register('callApi', ({ methodName, args }, context) => {
  const arr = args.map((p) => (p.startsWith('{{') && p.endsWith('}}') ? p.slice(2, -2) : `'${p}'`));
  const run = `{{ $api.${methodName}(${arr.join(', ')}) }}`;
  return parseTemplate(run, context, { $api });
});
