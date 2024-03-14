import type { DocumentData } from 'firebase/firestore'

import {
  type CollectionPath,
  type DocumentOutput,
  firestoreZodCollection,
  type FirestoreZodOptions,
  type ZodTypeDocumentData,
} from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionQuery = <
  Z extends ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionPath: CollectionPath | string,
  zod: Z,
  query: QuerySpecification,
  options?: FirestoreZodOptions,
) => applyQuerySpecification(firestoreZodCollection<Z, AppModelType, DbModelType>(collectionPath, zod, options), query)
