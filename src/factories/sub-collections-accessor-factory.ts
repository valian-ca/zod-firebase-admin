import type { Collections, Schema, SubCollectionsAccessor } from './types'
import type { FactoryOptions } from './factory-options'
import { collectionFactory } from './collection-factory'

export const subCollectionsAccessorFactory =
  <TSubCollectionsSchema extends Schema>(
    schema: TSubCollectionsSchema,
    options: FactoryOptions,
    parent: string
  ): SubCollectionsAccessor<TSubCollectionsSchema> =>
  (documentId) =>
    Object.entries(schema).reduce(
      (acc, [collectionName, collectionSchema]) => ({
        ...acc,
        [collectionName]: {
          ...collectionSchema,
          ...collectionFactory<string>(collectionName, collectionSchema, options, [parent, documentId]),
        },
      }),
      {} as Collections<TSubCollectionsSchema>
    )
