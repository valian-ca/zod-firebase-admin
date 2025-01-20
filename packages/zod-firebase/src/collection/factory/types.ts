import { type CollectionSchema } from '../../schema'

import { type MultiDocumentCollectionFactory } from './multi-document-collection-factory'
import { type SingleDocumentCollectionFactory } from './single-document-collection-factory'

export type SingleOrMultiDocumentCollectionFactory<TCollectionSchema extends CollectionSchema> =
  TCollectionSchema['singleDocumentKey'] extends string
    ? SingleDocumentCollectionFactory<TCollectionSchema>
    : MultiDocumentCollectionFactory<TCollectionSchema>

export type CollectionFactory<
  TCollectionName extends string,
  TCollectionSchema extends CollectionSchema,
> = SingleOrMultiDocumentCollectionFactory<TCollectionSchema> &
  TCollectionSchema & {
    readonly collectionName: TCollectionName
    readonly collectionPath: string
  }
