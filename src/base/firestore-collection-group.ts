import { type CollectionGroup, type DocumentData, getFirestore } from 'firebase-admin/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <T extends DocumentData>(collectionId: string, firestore = getFirestore()) =>
  firestore.collectionGroup(collectionId) as CollectionGroup<T>

export const firestoreZodCollectionGroup = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) => firestore.collectionGroup(collectionId).withConverter(firestoreZodDataConverter(zod, options))
