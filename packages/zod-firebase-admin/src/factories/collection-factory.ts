import { firestoreCollectionPath, type ZodTypeDocumentData } from '../base'

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

type SingleOrMultiDocumentCollectionFactory<TCollectionSchema extends CollectionSchema> =
  TCollectionSchema['singleDocumentKey'] extends string
    ? SingleDocumentCollectionFactory<TCollectionSchema>
    : MultiDocumentCollectionFactory<TCollectionSchema>

export type CollectionFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
> = SingleOrMultiDocumentCollectionFactory<TCollectionSchema> & {
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
  options?: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
) => {
  const factoryOptions = { ...options, includeDocumentIdForZod }
  const collection = (
    typeof singleDocumentKey === 'string'
      ? singleDocumentCollectionFactory(collectionName, zod, singleDocumentKey, factoryOptions, parentPath)
      : multiDocumentCollectionFactory(collectionName, zod, parentPath, factoryOptions)
  ) as SingleOrMultiDocumentCollectionFactory<TCollectionSchema>

  return {
    collectionName,
    collectionPath: parentPath ? firestoreCollectionPath([...parentPath, collectionName]) : collectionName,
    zod,
    ...collection,
  }
}
