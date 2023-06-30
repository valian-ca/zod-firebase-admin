import type { ZodTypeDocumentData } from '../base'

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
