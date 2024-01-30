import type { DocumentOutput, ZodTypeDocumentData } from '../base'
import type { QueryHelper } from '../query'

import type { CollectionFactory } from './collection-factory'

export type CollectionSchema<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TSubCollectionsSchema extends Schema = {},
> = {
  readonly zod: Z
  readonly singleDocumentKey?: string
  readonly includeDocumentIdForZod?: boolean
} & TSubCollectionsSchema

export type Schema = {
  [key: string]: CollectionSchema
}

export type SubCollectionsSchema<TSchema> =
  Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod'> extends Schema
    ? Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod'>
    : never

export type Collections<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema<infer Z>
      ? TSchema[CollectionName] & Collection<CollectionName, Z, TSchema[CollectionName]>
      : never
    : never
}

export type SubCollections<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema<infer Z>
      ? TSchema[CollectionName] & SubCollection<CollectionName, Z, TSchema[CollectionName]>
      : never
    : never
}

export type SubCollectionsAccessor<TSubCollectionsSchema extends Schema> = (
  documentId: string,
) => Collections<TSubCollectionsSchema>

export type Collection<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
> =
  SubCollectionsSchema<TCollectionSchema> extends Schema
    ? CollectionFactory<TCollectionName, Z, TCollectionSchema> &
        SubCollections<SubCollectionsSchema<TCollectionSchema>> &
        SubCollectionsAccessor<SubCollectionsSchema<TCollectionSchema>>
    : CollectionFactory<TCollectionName, Z, TCollectionSchema>

export type SubCollection<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
> =
  SubCollectionsSchema<TCollectionSchema> extends Schema
    ? TCollectionSchema & {
        readonly collectionName: TCollectionName
        readonly group: QueryHelper<DocumentOutput<Z>>
      } & SubCollections<SubCollectionsSchema<TCollectionSchema>>
    : TCollectionSchema & {
        readonly collectionName: TCollectionName
        readonly group: QueryHelper<DocumentOutput<Z>>
      }
