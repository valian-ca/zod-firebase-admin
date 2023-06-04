import { type DocumentData, type DocumentReference, getFirestore } from 'firebase-admin/firestore'
import type { CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { ZodTypeDocumentData } from './types'

export const firestoreDocument = <T extends DocumentData>(
  collectionPath: CollectionPath,
  documentId: string,
  firestore = getFirestore()
) => firestore.doc(firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<T>

export const firestoreZodDocument = <Z extends ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  documentId: string,
  zod: Z,
  firestore = getFirestore()
) => firestore.doc(firestoreDocumentPath(collectionPath, documentId)).withConverter(firestoreZodDataConverter(zod))
