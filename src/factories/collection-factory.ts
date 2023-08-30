import { firestoreCollectionPath, type ZodTypeDocumentData } from '../base'

import type { FactoryOptions } from './factory-options'
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
> = TCollectionSchema['singleDocumentKey'] extends string
  ? SingleDocumentCollectionFactory<Z>
  : MultiDocumentCollectionFactory<Z>

export type CollectionFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
> = SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema> & {
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
  { zod, singleDocumentKey }: TCollectionSchema,
  options: FactoryOptions,
  parentPath?: [string, string],
) => {
  const collection = (
    typeof singleDocumentKey === 'string'
      ? singleDocumentCollectionFactory(collectionName, zod, singleDocumentKey, options, parentPath)
      : multiDocumentCollectionFactory(collectionName, zod, options, parentPath)
  ) as SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema>
  return {
    collectionName,
    collectionPath: parentPath ? firestoreCollectionPath([...parentPath, collectionName]) : collectionName,
    zod,
    ...collection,
  }
}
