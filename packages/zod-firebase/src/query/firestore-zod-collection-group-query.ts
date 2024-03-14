import type { DocumentData } from 'firebase/firestore'

import {
  type DocumentOutput,
  firestoreZodCollectionGroup,
  type FirestoreZodOptions,
  type ZodTypeDocumentData,
} from '../base'

import { applyQuerySpecification, type QuerySpecification } from './query-specification'

export const firestoreZodCollectionGroupQuery = <
  Z extends ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionId: string,
  zod: Z,
  query: QuerySpecification,
  options?: FirestoreZodOptions,
) =>
  applyQuerySpecification(firestoreZodCollectionGroup<Z, AppModelType, DbModelType>(collectionId, zod, options), query)
