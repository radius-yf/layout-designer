import { createContext } from '@/utils/createContext'
import type { Component } from 'vue'

export const [provideComponent, useComponent] = createContext<(name: string) => Component>()

export const [provideEndPoint, useEndPoint] = createContext({ x: 0, y: 0 })
