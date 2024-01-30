import { collection, type CollectionReference, type DocumentData, getFirestore } from 'firebase/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { ZodTypeDocumentData } from './types'

export const firestoreCollection = <T extends DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => collection(firestore, firestoreCollectionPath(collectionPath)) as CollectionReference<T>

export const firestoreZodCollection = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath | string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) =>
  collection(firestore, firestoreCollectionPath(collectionPath)).withConverter(firestoreZodDataConverter(zod, options))
