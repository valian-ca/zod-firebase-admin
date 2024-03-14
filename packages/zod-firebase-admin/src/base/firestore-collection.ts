import { type CollectionReference, type DocumentData, getFirestore } from 'firebase-admin/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => firestore.collection(firestoreCollectionPath(collectionPath)) as CollectionReference<AppModelType, DbModelType>

export const firestoreZodCollection = <
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TOutput extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionPath: CollectionPath | string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): CollectionReference<TOutput> =>
  firestore
    .collection(firestoreCollectionPath(collectionPath))
    .withConverter(firestoreZodDataConverter<Z, TOutput, DbModelType>(zod, options))
