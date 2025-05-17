import type { ActionFlow, Actions, AllAction, Content } from './type';
import { parseTemplate } from './utils';

const actions: Actions = {
  condition: (step, context) =>
    runAction((parseTemplate(step.condition, context) ? step.then : step.els) ?? [], context),
};
function runStep<T extends keyof AllAction>(action: T, step: AllAction[T], context: Content) {
  if (!actions[action]) {
    throw new Error(`未找到动作 ${action}`);
  }
  return actions[action](step, context);
}

export async function runAction(action: ActionFlow, context: Content) {
  const currentContext = {
    ...context,
    outputVar: { ...context.outputVar },
  };
  let result: any = null;
  for (const step of action) {
    currentContext.outputVar[step.outputVar ?? 'temp'] = result = await runStep(step.action, step, currentContext);
  }
  return result;
}

export function register<T extends keyof Actions>(action: T, fn: Actions[T], rewrite = false) {
  if (action in actions && !rewrite) {
    console.warn('动作已存在', action);
  }
  actions[action] = fn;
}
