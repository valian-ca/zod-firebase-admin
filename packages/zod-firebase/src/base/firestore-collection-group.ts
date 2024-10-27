import { collectionGroup, type DocumentData, getFirestore, type Query } from '@firebase/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import { type FirestoreZodOptions } from './firestore-zod-options'
import { type DocumentInput, type DocumentOutput, type MetaOutputOptions, type ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => collectionGroup(firestore, collectionId) as Query<AppModelType, DbModelType>

export const firestoreZodCollectionGroup = <
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
>(
  collectionId: string,
  zod: Z,
  outputOptions?: OutputOptions,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
) =>
  collectionGroup(firestore, collectionId).withConverter(
    firestoreZodDataConverter<Z, OutputOptions, AppModelType, DbModelType>(zod, outputOptions, options),
  )
