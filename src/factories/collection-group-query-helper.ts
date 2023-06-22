import type { ZodTypeDocumentData } from '../base'
import type { CollectionSchema } from './types'
import type { FactoryOptions } from './factory-options'
import { firestoreZodCollectionGroupQuery, queryHelper } from '../query'

export const collectionGroupQueryHelper = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
>(
  collectionName: TCollectionName,
  { zod }: TCollectionSchema,
  { getFirestore }: FactoryOptions
) => queryHelper((query) => firestoreZodCollectionGroupQuery(collectionName, zod, query, getFirestore()))
