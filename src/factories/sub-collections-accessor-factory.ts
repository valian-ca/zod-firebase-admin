import { collectionFactory } from './collection-factory'
import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import type { Collections, Schema, SubCollectionsAccessor } from './types'

export const subCollectionsAccessorFactory =
  <TSubCollectionsSchema extends Schema>(
    schema: TSubCollectionsSchema,
    options: FirestoreZodFactoryOptions,
    parent: string,
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
      {} as Collections<TSubCollectionsSchema>,
    )
