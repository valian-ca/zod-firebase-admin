import type { ZodTypeDocumentData } from '../base'

import { collectionGroupQueryHelper } from './collection-group-query-helper'
import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import type { CollectionSchema, SubCollection, SubCollections, SubCollectionsSchema } from './types'

export const subCollectionsFactory = <TCollectionSchema>(
  subCollectionsSchema: SubCollectionsSchema<TCollectionSchema>,
  options?: FirestoreZodFactoryOptions,
) =>
  Object.entries(subCollectionsSchema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      [collectionName]: subCollectionFactory(collectionSchema, collectionName, options),
    }),
    {} as SubCollections<SubCollectionsSchema<TCollectionSchema>>,
  )

const subCollectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionSchema: TCollectionSchema,
  collectionName: TCollectionName,
  options?: FirestoreZodFactoryOptions,
): SubCollection<TCollectionName, Z, TCollectionSchema> => {
  const subCollection = {
    ...collectionSchema,
    collectionName,
    group: collectionGroupQueryHelper(collectionName, collectionSchema, options),
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { zod, singleDocumentKey, includeDocumentIdForZod, ...rest } = collectionSchema
  if (Object.keys(rest).length === 0) {
    return subCollection as SubCollection<TCollectionName, Z, TCollectionSchema>
  }

  return { ...subCollection, ...subCollectionsFactory(rest as SubCollectionsSchema<TCollectionSchema>, options) }
}
