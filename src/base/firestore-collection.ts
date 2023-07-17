import { type CollectionReference, type DocumentData, getFirestore } from 'firebase-admin/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { ZodTypeDocumentData } from './types'

export const firestoreCollection = <T extends DocumentData>(
  collectionPath: CollectionPath,
  firestore = getFirestore(),
) => firestore.collection(firestoreCollectionPath(collectionPath)) as CollectionReference<T>

export const firestoreZodCollection = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  zod: Z,
  firestore = getFirestore(),
) => firestore.collection(firestoreCollectionPath(collectionPath)).withConverter(firestoreZodDataConverter(zod))
