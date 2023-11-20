import type { DocumentData } from 'firebase-admin/firestore'

import { type DocumentInput, type DocumentOutput, firestoreCollectionPath, type ZodTypeDocumentData } from '../base'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import {
  type MultiDocumentCollectionFactory,
  multiDocumentCollectionFactory,
} from './multi-document-collection-factory'
import {
  type SingleDocumentCollectionFactory,
  singleDocumentCollectionFactory,
} from './single-document-collection-factory'
import type { CollectionSchema } from './types'

type SingleOrMultiDocumentCollectionFactory<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = TCollectionSchema['singleDocumentKey'] extends string
  ? SingleDocumentCollectionFactory<Z, TInput, TOutput>
  : MultiDocumentCollectionFactory<Z, TInput, TOutput>

export type CollectionFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput> & {
  readonly collectionName: TCollectionName
  readonly collectionPath: string
  readonly zod: Z
}

export const collectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: TCollectionName,
  { zod, singleDocumentKey, includeDocumentIdForZod }: TCollectionSchema,
  options: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
) => {
  const factoryOptions = { ...options, includeDocumentIdForZod }
  const collection = (
    typeof singleDocumentKey === 'string'
      ? singleDocumentCollectionFactory(collectionName, zod, singleDocumentKey, factoryOptions, parentPath)
      : multiDocumentCollectionFactory(collectionName, zod, factoryOptions, parentPath)
  ) as SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema>

  return {
    collectionName,
    collectionPath: parentPath ? firestoreCollectionPath([...parentPath, collectionName]) : collectionName,
    zod,
    ...collection,
  }
}
