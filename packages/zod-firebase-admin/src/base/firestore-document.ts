import { type DocumentData, type DocumentReference, getFirestore } from 'firebase-admin/firestore'

import type { CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreDocument = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  documentId: string,
  firestore = getFirestore(),
) => firestore.doc(firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<AppModelType, DbModelType>

export const firestoreZodDocument = <
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionPath: CollectionPath | string,
  documentId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): DocumentReference<AppModelType, DbModelType> =>
  firestore
    .doc(firestoreDocumentPath(collectionPath, documentId))
    .withConverter(firestoreZodDataConverter<Z, AppModelType, DbModelType>(zod, options))
