import { getFirestore } from 'firebase-admin/firestore'

import { firestoreZodCollectionGroup, type ZodTypeDocumentData } from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionGroupQuery = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  query: QuerySpecification,
  firestore = getFirestore(),
) => applyQuerySpecification(firestoreZodCollectionGroup(collectionId, zod, firestore), query)
