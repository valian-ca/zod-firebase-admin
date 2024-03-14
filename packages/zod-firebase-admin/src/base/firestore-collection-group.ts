import { type CollectionGroup, type DocumentData, getFirestore } from 'firebase-admin/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => firestore.collectionGroup(collectionId) as CollectionGroup<AppModelType, DbModelType>

export const firestoreZodCollectionGroup = <
  Z extends ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) =>
  firestore
    .collectionGroup(collectionId)
    .withConverter(firestoreZodDataConverter<Z, AppModelType, DbModelType>(zod, options))
