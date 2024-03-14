import { collectionGroup, type DocumentData, getFirestore, type Query } from 'firebase/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import type { FirestoreZodOptions } from './firestore-zod-options'
import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => collectionGroup(firestore, collectionId) as Query<AppModelType, DbModelType>

export const firestoreZodCollectionGroup = <
  Z extends ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionId: string,
  zod: Z,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) =>
  collectionGroup(firestore, collectionId).withConverter(
    firestoreZodDataConverter<Z, AppModelType, DbModelType>(zod, options),
  )
