import type { FactoryOptions } from './factory-options'
import {
  multiDocumentCollectionFactory,
  type MultiDocumentCollectionFactory,
} from './multi-document-collection-factory'
import {
  singleDocumentCollectionFactory,
  type SingleDocumentCollectionFactory,
} from './single-document-collection-factory'
import type { CollectionSchema } from './types'
import type { ZodTypeDocumentData } from '../base'

export type CollectionFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
> = TCollectionSchema['singleDocumentKey'] extends string
  ? SingleDocumentCollectionFactory<TCollectionName, Z>
  : MultiDocumentCollectionFactory<TCollectionName, Z>

export const collectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
>(
  collectionName: TCollectionName,
  { zod, singleDocumentKey }: TCollectionSchema,
  options: FactoryOptions,
  parentPath?: [string, string]
) =>
  (singleDocumentKey
    ? singleDocumentCollectionFactory(collectionName, zod, singleDocumentKey, options, parentPath)
    : multiDocumentCollectionFactory(collectionName, zod, options, parentPath)) as CollectionFactory<
    TCollectionName,
    Z,
    TCollectionSchema
  >
