import { register } from './action';
import { parseTemplate } from './utils';

declare module './type.ts' {
  interface AllAction {
    call: {
      // {{ $('id').method(args) }}
      // run: TemplateString;
      compId: string; // run可能使用其他组件的数据，这里记录组件id，方便ui使用
      methodName: string;
      args: TemplateString[];
    };
  }
}
register('call', ({ compId, methodName, args }, context) => {
  const arr = args.map((p) => (p.startsWith('{{') && p.endsWith('}}') ? p.slice(2, -2) : `'${p}'`));
  const run = `{{ $('${compId}')?.${methodName}(${arr.join(', ')}) }}`;
  return parseTemplate(run, context);
});
