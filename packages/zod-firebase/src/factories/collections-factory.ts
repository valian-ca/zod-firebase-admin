import type { ZodTypeDocumentData } from '../base'

import { collectionFactory } from './collection-factory'
import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { subCollectionsFactory } from './sub-collections-factory'
import type { Collection, Collections, CollectionSchema, Schema, SubCollectionsSchema } from './types'

export const collectionsFactory = <TSchema extends Schema>(
  schema: TSchema,
  options?: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
) =>
  Object.entries(schema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      [collectionName]: collectionWithSubCollectionsFactory(collectionName, collectionSchema, options, parentPath),
    }),
    {} as Collections<TSchema>,
  )

export const collectionWithSubCollectionsFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: TCollectionName,
  collectionSchema: TCollectionSchema,
  options?: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
): Collection<TCollectionName, Z, TCollectionSchema> => {
  const collection = collectionFactory(collectionName, collectionSchema, options, parentPath)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { zod, singleDocumentKey, includeDocumentIdForZod, ...rest } = collectionSchema
  if (Object.keys(rest).length === 0) {
    return collection as Collection<TCollectionName, Z, TCollectionSchema>
  }

  const subCollectionsSchema = rest as SubCollectionsSchema<TCollectionSchema>
  const subCollections = subCollectionsFactory(subCollectionsSchema, options)
  const subCollectionsAccessor = (documentId: string) =>
    collectionsFactory(subCollectionsSchema, options, [collection.collectionPath, documentId])

  return Object.assign(subCollectionsAccessor, collection, subCollections) as Collection<
    TCollectionName,
    Z,
    TCollectionSchema
  >
}
