import { collectionWithSubCollectionsFactory } from './collection-with-subcollection-factory'
import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import type { Collections, Schema } from './types'

export const collectionsFactory = <TSchema extends Schema>(schema: TSchema, options: FirestoreZodFactoryOptions) =>
  Object.entries(schema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      [collectionName]: collectionWithSubCollectionsFactory(collectionName, collectionSchema, options),
    }),
    {} as Collections<TSchema>,
  )
