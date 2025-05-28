import { inject, provide, ref, type InjectionKey, type Ref, type UnwrapRef } from 'vue'

type Provide<T> = {
  (): Ref<UnwrapRef<T | undefined>>
  (context: T): Ref<UnwrapRef<T>>
}

export function createContext<T>(): [provide: Provide<T>, use: () => Ref<UnwrapRef<T | undefined>>]
export function createContext<T>(p: T): [provide: (context?: T) => Ref<UnwrapRef<T>>, use: () => Ref<UnwrapRef<T>>]
export function createContext<T>(p?: T) {
  const token = Symbol() as InjectionKey<Ref<UnwrapRef<T>>>

  const provideContext = (context?: T) => {
    const result = ref(context ?? p) as Ref<UnwrapRef<T>>
    provide(token, result)
    return result
  }

  const useContext = () => {
    const result = inject(token, null)
    if (!result) {
      throw new Error('inject failed: context not provided')
    }
    return result
  }

  return [provideContext, useContext] as const
}
