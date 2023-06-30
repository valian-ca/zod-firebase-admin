import type { ZodTypeDocumentData } from '../base'

import { collectionFactory } from './collection-factory'
import type { FactoryOptions } from './factory-options'
import { subCollectionsAccessorFactory } from './sub-collections-accessor-factory'
import { subCollectionsFactory } from './sub-collections-factory'
import type { Collection, CollectionSchema, SubCollectionsSchema } from './types'

export const collectionWithSubCollectionsFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
>(
  collectionName: TCollectionName,
  collectionSchema: TCollectionSchema,
  options: FactoryOptions
): Collection<TCollectionName, Z, TCollectionSchema> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { zod, singleDocumentKey, ...rest } = collectionSchema
  const collection = collectionFactory(collectionName, collectionSchema, options)

  if (Object.keys(rest).length === 0) {
    return collection as Collection<TCollectionName, Z, TCollectionSchema>
  }

  const subCollectionsSchema = rest as SubCollectionsSchema<TCollectionSchema>
  const subCollections = subCollectionsFactory(subCollectionsSchema, options)
  const subCollectionsAccessor = subCollectionsAccessorFactory(subCollectionsSchema, options, collectionName)

  return Object.assign(subCollectionsAccessor, collection, subCollections) as Collection<
    TCollectionName,
    Z,
    TCollectionSchema
  >
}
