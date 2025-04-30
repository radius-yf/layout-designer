import { parse, rewriteDefault } from '@vue/compiler-sfc'
import vue from '@vitejs/plugin-vue'
import { Plugin } from 'vite'

export default function plugin(): Plugin {
  const vuePlugin = vue()
  return {
    ...vuePlugin,
    name: 'vite-plugin-layout-designer',
    async transform(code, id, opt) {
      const result = await (vuePlugin.transform as any)(code, id, opt)

      const { descriptor } = parse(code)
      if (descriptor.scriptSetup?.attrs['hoc']) {
        const [path, hoc] = (descriptor.scriptSetup.attrs['hoc'] as string).split('#')
        const importCode = hoc ? `import { ${hoc} as _hoc } from '${path}';` : `import _hoc from '${path}';`
        result.code = `${rewriteDefault(result.code, '__origin_comp__')}
${importCode}
export default _hoc(__origin_comp__);`
      }
      return result
    },
  }
}
