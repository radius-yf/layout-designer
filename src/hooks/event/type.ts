// 模板字符串 是指用 {{}} 包裹的字符串
export type TemplateString = string;

export interface Content {
  // {{ $('id') }}
  $: (id: string) => any;
  // {{ $val('id') }}
  $val: (id: string) => any;
  // {{ key }}
  outputVar: { [key: string]: any };
}

export interface AllAction {
  condition: {
    condition: TemplateString;
    then?: ActionFlow;
    els?: ActionFlow;
  };
}

export type LogicAction = {
  [key in keyof AllAction]: { action: key; outputVar?: string } & AllAction[key];
};

export type Actions = {
  [key in keyof AllAction]?: (p: AllAction[key], context: Content) => any;
};

export type ActionFlow = LogicAction[keyof LogicAction][];
