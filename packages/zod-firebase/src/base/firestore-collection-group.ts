import { collectionGroup, type DocumentData, getFirestore, type Query } from 'firebase/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <T extends DocumentData>(collectionId: string, firestore = getFirestore()) =>
  collectionGroup(firestore, collectionId) as Query<T>

export const firestoreZodCollectionGroup = <Z extends ZodTypeDocumentData>(
  collectionId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) => collectionGroup(firestore, collectionId).withConverter(firestoreZodDataConverter(zod, options))
