import { firestoreZodCollectionGroup, type FirestoreZodOptions, type ZodTypeDocumentData } from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionGroupQuery = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  query: QuerySpecification,
  options?: FirestoreZodOptions,
) => applyQuerySpecification(firestoreZodCollectionGroup(collectionId, zod, options), query)
