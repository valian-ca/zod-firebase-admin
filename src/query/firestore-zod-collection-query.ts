import { getFirestore } from 'firebase-admin/firestore'

import { type CollectionPath, firestoreZodCollection, type ZodTypeDocumentData } from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionQuery = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  zod: Z,
  query: QuerySpecification,
  firestore = getFirestore()
) => applyQuerySpecification(firestoreZodCollection(collectionPath, zod, firestore), query)
