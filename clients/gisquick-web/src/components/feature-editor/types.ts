import type Feature from 'ol/Feature'

import type { LayerList } from '@/store/interfaces'

export type Layer = LayerList
export type Value = string | null | number
export type Operation = 'insert' | 'update' | 'delete'
export type Fields = Record<string, Value | (() => Value)>
export type RelationsData = Record<string, Fields[]>
export type ResolvedFields = Record<string, Value>
export type RelationsFeaturesWithData = Record<string, Feature[]>
