import { collection, type CollectionReference, type DocumentData, getFirestore } from '@firebase/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import { type FirestoreZodOptions } from './firestore-zod-options'
import { type DocumentInput, type DocumentOutput, type MetaOutputOptions, type ZodTypeDocumentData } from './types'

export const firestoreCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => collection(firestore, firestoreCollectionPath(collectionPath)) as CollectionReference<AppModelType, DbModelType>

export const firestoreZodCollection = <
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
>(
  collectionPath: CollectionPath | string,
  zod: Z,
  outputOptions?: OutputOptions,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): CollectionReference<AppModelType, DbModelType> =>
  collection(firestore, firestoreCollectionPath(collectionPath)).withConverter(
    firestoreZodDataConverter<Z, OutputOptions, AppModelType, DbModelType>(zod, outputOptions, options),
  )
