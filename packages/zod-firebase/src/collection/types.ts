import { type EmptyObject } from 'type-fest'

import { type CollectionSchema, type Schema, type SchemaFirestoreQueryFactory } from '../schema'

import { type CollectionFactory } from './factory'

export type SubCollectionsSchema<TSchema> =
  Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod' | 'readonlyDocuments'> extends Schema
    ? Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod' | 'readonlyDocuments'>
    : EmptyObject

export type Collections<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema
      ? TSchema[CollectionName] & Collection<CollectionName, TSchema[CollectionName]>
      : never
    : never
}

export type SubCollections<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema
      ? TSchema[CollectionName] & SubCollection<CollectionName, TSchema[CollectionName]>
      : never
    : never
}

export type SubCollectionsAccessor<TSchema extends Schema> = (documentId: string) => Collections<TSchema>

export type Collection<TCollectionName extends string, TCollectionSchema extends CollectionSchema> =
  SubCollectionsSchema<TCollectionSchema> extends Schema
    ? CollectionFactory<TCollectionName, TCollectionSchema> &
        SubCollections<SubCollectionsSchema<TCollectionSchema>> &
        SubCollectionsAccessor<SubCollectionsSchema<TCollectionSchema>>
    : CollectionFactory<TCollectionName, TCollectionSchema>

export type SubCollection<TCollectionName extends string, TCollectionSchema extends CollectionSchema> =
  SubCollectionsSchema<TCollectionSchema> extends Schema
    ? TCollectionSchema & {
        readonly collectionName: TCollectionName
        readonly group: SchemaFirestoreQueryFactory<TCollectionSchema>
      } & SubCollections<SubCollectionsSchema<TCollectionSchema>>
    : TCollectionSchema & {
        readonly collectionName: TCollectionName
        readonly group: SchemaFirestoreQueryFactory<TCollectionSchema>
      }
