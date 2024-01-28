import { type DocumentData, type DocumentReference, getFirestore } from 'firebase-admin/firestore'

import type { CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreDocument = <T extends DocumentData>(
  collectionPath: CollectionPath | string,
  documentId: string,
  firestore = getFirestore(),
) => firestore.doc(firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<T>

export const firestoreZodDocument = <Z extends ZodTypeDocumentData = ZodTypeDocumentData>(
  collectionPath: CollectionPath | string,
  documentId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): DocumentReference<DocumentOutput<Z>> =>
  firestore
    .doc(firestoreDocumentPath(collectionPath, documentId))
    .withConverter(firestoreZodDataConverter(zod, options))
