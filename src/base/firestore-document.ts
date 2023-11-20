import { type DocumentData, type DocumentReference, getFirestore } from 'firebase-admin/firestore'

import type { CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'
import { firestoreZodDataConverter, type FirestoreZodDataConverterOptions } from './firestore-zod-data-converter'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreDocument = <T extends DocumentData>(
  collectionPath: CollectionPath,
  documentId: string,
  firestore = getFirestore(),
) => firestore.doc(firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<T>

export const firestoreZodDocument = <Z extends ZodTypeDocumentData = ZodTypeDocumentData>(
  collectionPath: CollectionPath,
  documentId: string,
  zod: Z,
  options?: FirestoreZodDataConverterOptions,
  firestore = getFirestore(),
): DocumentReference<DocumentOutput<Z>> =>
  firestore
    .doc(firestoreDocumentPath(collectionPath, documentId))
    .withConverter(firestoreZodDataConverter(zod, options))
