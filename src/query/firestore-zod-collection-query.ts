import { getFirestore } from 'firebase-admin/firestore'
import { type CollectionPath, type ZodTypeDocumentData, firestoreZodCollection } from '../base'
import { type QuerySpecification, applyQuerySpecification } from './query-specification'

export const firestoreZodCollectionQuery = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  zod: Z,
  query: QuerySpecification,
  firestore = getFirestore()
) => applyQuerySpecification(firestoreZodCollection(collectionPath, zod, firestore), query)
