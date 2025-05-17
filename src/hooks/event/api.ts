import { addData } from '@/api/table/index';
import { pickBy } from 'lodash-es';
interface Api {
  name: string;
  value: string;
  description: string;
  fn: (...args: unknown[]) => unknown;
}

const api: Record<string, Api> = {
  saveForm: {
    name: '保存表单',
    value: 'saveForm',
    description: '保存表单',
    fn: async (...args: unknown[]) => {
      console.log('args', args[0]);
      const params = pickBy(args[0] as Record<string, unknown>);
      const { code, data } = await addData(params);
      console.log('res', code, data);
      if (code === 200) {
        return {
          ...api.saveForm,
          code,
          data,
        };
      }
    },
  },
};

export default api;
