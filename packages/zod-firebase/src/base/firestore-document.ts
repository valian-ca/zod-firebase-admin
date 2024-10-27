import { doc, type DocumentData, type DocumentReference, getFirestore } from '@firebase/firestore'

import { type CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'
import { firestoreZodDataConverter } from './firestore-zod-data-converter'
import { type FirestoreZodOptions } from './firestore-zod-options'
import { type DocumentInput, type DocumentOutput, type MetaOutputOptions, type ZodTypeDocumentData } from './types'

export const firestoreDocument = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  documentId: string,
  firestore = getFirestore(),
) => doc(firestore, firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<AppModelType, DbModelType>

export const firestoreZodDocument = <
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
>(
  collectionPath: CollectionPath | string,
  documentId: string,
  zod: Z,
  outputOptions?: OutputOptions,
  { firestore = getFirestore(), ...options }: FirestoreZodOptions = {},
): DocumentReference<AppModelType, DbModelType> =>
  doc(firestore, firestoreDocumentPath(collectionPath, documentId)).withConverter(
    firestoreZodDataConverter<Z, OutputOptions, AppModelType, DbModelType>(zod, outputOptions, options),
  )
