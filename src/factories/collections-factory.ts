import { collectionWithSubCollectionsFactory } from './collection-with-subcollection-factory'
import type { FactoryOptions } from './factory-options'
import type { Collections, Schema } from './types'

export const collectionsFactory = <TSchema extends Schema>(schema: TSchema, options: FactoryOptions) =>
  Object.entries(schema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      [collectionName]: collectionWithSubCollectionsFactory(collectionName, collectionSchema, options),
    }),
    {} as Collections<TSchema>
  )
