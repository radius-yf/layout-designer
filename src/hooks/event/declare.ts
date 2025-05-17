import { register } from './action';
import { parseTemplate } from './utils';

declare module './type.ts' {
  interface AllAction {
    declare:
      | {
          fields: {
            compId?: string; // value可能使用其他组件的数据，这里记录组件id，方便后续使用
            name: string;
            // '{{ $val('id') }}' 使用其他组件的数据
            // '{{ name }}' 使用当前上下文的数据
            // '{{ 123 }}' 使用数字、布尔值等
            value: TemplateString;
          }[];
        }
      | {
          compId?: string; // value可能使用其他组件的数据，这里记录组件id，方便后续使用
          // '{{ $val('id') }}' 使用其他组件的数据
          // '{{ name }}' 使用当前上下文的数据
          // '{{ 123 }}' 使用数字、布尔值等
          value: TemplateString;
        };
  }
}

register('declare', (p, context) => {
  if ('fields' in p) {
    const result: Record<string, any> = {};
    for (const item of p.fields) {
      result[item.name] = parseTemplate(item.value, context);
    }
    return result;
  } else {
    return parseTemplate(p.value, context);
  }
});
