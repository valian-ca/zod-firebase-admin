import {
  type CollectionPath,
  firestoreZodCollection,
  type FirestoreZodOptions,
  type ZodTypeDocumentData,
} from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionQuery = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  zod: Z,
  query: QuerySpecification,
  options?: FirestoreZodOptions,
) => applyQuerySpecification(firestoreZodCollection(collectionPath, zod, options), query)
