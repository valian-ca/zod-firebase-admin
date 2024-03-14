import { collection, type CollectionReference, type DocumentData, getFirestore } from 'firebase/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => collection(firestore, firestoreCollectionPath(collectionPath)) as CollectionReference<AppModelType, DbModelType>

export const firestoreZodCollection = <
  Z extends ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionPath: CollectionPath | string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): CollectionReference<AppModelType, DbModelType> =>
  collection(firestore, firestoreCollectionPath(collectionPath)).withConverter(
    firestoreZodDataConverter<Z, AppModelType, DbModelType>(zod, options),
  )
