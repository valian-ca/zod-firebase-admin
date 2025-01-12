import {
  type CollectionGroup,
  type DocumentData,
  type FirestoreDataConverter,
  getFirestore,
} from 'firebase-admin/firestore'

import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import { type FirestoreZodOptions } from './firestore-zod-options'
import { type DocumentInput, type DocumentOutput, type MetaOutputOptions, type ZodTypeDocumentData } from './types'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => firestore.collectionGroup(collectionId) as CollectionGroup<AppModelType, DbModelType>

export const firestoreCollectionGroupWithConverter = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionId: string,
  converter: FirestoreDataConverter<AppModelType, DbModelType>,
  firestore = getFirestore(),
) => firestore.collectionGroup(collectionId).withConverter(converter)

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
  firestore
    .collectionGroup(collectionId)
    .withConverter(firestoreZodDataConverter<Z, OutputOptions, AppModelType, DbModelType>(zod, outputOptions, options))
