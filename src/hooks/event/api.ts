interface Api {
  name: string;
  value: string;
  description: string;
  fn: (...args: unknown[]) => unknown;
}

const api: Record<string, Api> = {
};

export default api;
