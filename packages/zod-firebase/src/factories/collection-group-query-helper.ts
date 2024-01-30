import type { ZodTypeDocumentData } from '../base'
import { firestoreZodCollectionGroupQuery, queryHelper } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import type { CollectionSchema } from './types'

export const collectionGroupQueryHelper = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: TCollectionName,
  { zod }: TCollectionSchema,
  options?: FirestoreZodFactoryOptions,
) => queryHelper((query) => firestoreZodCollectionGroupQuery(collectionName, zod, query, options))
