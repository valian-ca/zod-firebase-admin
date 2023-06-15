import { getFirestore } from 'firebase-admin/firestore'
import { type ZodTypeDocumentData, firestoreZodCollectionGroup } from '../base'
import { type QuerySpecification, applyQuerySpecification } from './query-specification'

export const firestoreZodCollectionGroupQuery = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  query: QuerySpecification,
  firestore = getFirestore()
) => applyQuerySpecification(firestoreZodCollectionGroup(collectionId, zod, firestore), query)
