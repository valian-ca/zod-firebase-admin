import { getFirestore, type DocumentData, type CollectionGroup } from 'firebase-admin/firestore'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <T extends DocumentData>(collectionId: string, firestore = getFirestore()) =>
  firestore.collectionGroup(collectionId) as CollectionGroup<T>

export const firestoreZodCollectionGroup = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  firestore = getFirestore()
) => firestore.collectionGroup(collectionId).withConverter(firestoreZodDataConverter(zod))
