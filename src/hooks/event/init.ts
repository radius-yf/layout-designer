import { register } from './action';
import { parseTemplate } from './utils';
import allApi from './api';

declare module './type.ts' {
  interface AllAction {
    initApi: {
      baseURL?: string;
      defaultParams?: Record<string, any>;
    };
  }
}

export function initApi(config?: { baseURL?: string; defaultParams?: Record<string, any> }) {
  if (config?.baseURL) {
    $api._baseURL = config.baseURL;
  }
  if (config?.defaultParams) {
    $api._defaultParams = config.defaultParams;
  }

  Object.entries(allApi).forEach(([key, value]) => {
    $api[key] = (...args: unknown[]) => {
      return value.fn(...args, $api._defaultParams);
    };
  });
}

// 注册初始化动作（添加参数支持）
register('initApi', (config) => {
  initApi(config);
  return parseTemplate(
    `{{ { 
    status: 'success', 
    message: 'API初始化完成',
    params: ${JSON.stringify(config?.defaultParams || {})}
  } }}`,
    {}
  );
});
