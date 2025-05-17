import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  provide,
  ref,
  unref,
  useId,
  warn,
  watch,
  watchEffect,
  type Component,
  type ComponentInternalInstance,
  type InjectionKey,
  type Ref,
} from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

const REST_STATE = Symbol('REST_STATE') as InjectionKey<{
  parent: ComponentInternalInstance
  state: unknown[]
  count: Ref<number>
  onChange?: (count: number, newValue: unknown) => void
}>
function provideRestState(initialState?: unknown[], onChange?: (count: number, value: unknown) => void) {
  const instance = getCurrentInstance()!
  const meta = {
    parent: instance,
    state: initialState ?? [],
    count: ref(0),
    onChange,
  }
  provide(REST_STATE, meta)
  if (initialState) {
    const handle = watch(meta.count, (val) => {
      if (val > initialState.length) {
        warn('An exception occurred while restoring the state')
        handle.stop()
      }
    })
    onMounted(() => {
      if (meta.count.value !== initialState.length) {
        warn('An exception occurred while restoring the state')
      }
      handle.stop()
    })
  }

  return meta
}

export const withRestState = <C extends Component>(comp: C) => {
  return defineComponent(
    (props: { state?: unknown[] } & ComponentProps<C>, { emit, attrs }) => {
      const meta = provideRestState(props.state, (count, value) => {
        emit('change', { state: meta.state, count, value })
      })
      const id = useId()
      const count = ref(0)

      watch(
        () => props.state,
        () => {
          meta.state = props.state ?? []
          meta.count.value = 0
          count.value++
        }
      )
      return () => h(comp, { key: `${id}-${count.value}`, ...attrs })
    },
    {
      props: ['state'],
      emits: {
        change: (_event: { state: unknown[]; count: number; value: unknown }) => true,
      },
    }
  )
}

// useState 返回一个可以恢复状态的Ref
// 实现恢复状态需要两个代价
// 1. useState必须在setup顶层调用，即不能在if/for/while等语句中使用
//    可以在自定义hook中使用useState，但是自定义hook也必须在setup顶层调用，与React的规则一样。
// 2. 使用useState的组件必须用withRestState包裹
export function useState<T>(): Ref<T | undefined>
export function useState<T>(initialState: T): Ref<T>
export function useState<T>(initialState?: T) {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useState must be called within a setup function')
  }
  const meta = inject(REST_STATE, null)
  if (!meta || meta.parent !== instance.parent) {
    throw new Error('useState must be called within a withRestState')
  }
  const index = meta.count.value
  meta.count.value++
  const state = ref(index >= meta.state.length ? initialState : (meta.state[index] as T))
  watchEffect(() => {
    meta.state[index] = unref(state)
  })
  watch(state, () => meta.onChange?.(index, state.value), { deep: true })
  return state
}
