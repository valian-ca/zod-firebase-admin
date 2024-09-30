import { type CollectionGroup, type CollectionReference, type DocumentReference } from 'firebase-admin/firestore'
import { type EmptyObject, type ReadonlyDeep } from 'type-fest'
import { type z } from 'zod'

import {
  type DocumentOutput,
  type MetaOutputOptions,
  type ReadonlyDocumentOutput,
  type ZodTypeDocumentData,
} from '../base'

import { type CollectionFactory } from './collection-factory'
import { type SchemaQueryHelper } from './schema-query-helper'

export type CollectionSchema<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TSubCollectionsSchema extends Schema = EmptyObject,
> = {
  readonly zod: Z
  readonly singleDocumentKey?: string
  readonly includeDocumentIdForZod?: true
  readonly readonlyDocuments?: true
} & TSubCollectionsSchema

export type Schema = Record<string, CollectionSchema>

export type SubCollectionsSchema<TSchema> =
  Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod' | 'readonlyDocuments'> extends Schema
    ? Omit<TSchema, 'zod' | 'singleDocumentKey' | 'includeDocumentIdForZod' | 'readonlyDocuments'>
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
        readonly group: SchemaQueryHelper<TCollectionSchema>
      } & SubCollections<SubCollectionsSchema<TCollectionSchema>>
    : TCollectionSchema & {
        readonly collectionName: TCollectionName
        readonly group: SchemaQueryHelper<TCollectionSchema>
      }

type CollectionSchemaZod<TCollectionSchema> = TCollectionSchema extends CollectionSchema<infer Z> ? Z : never

export type SchemaDocumentInput<TCollectionSchema extends CollectionSchema> =
  | z.input<CollectionSchemaZod<TCollectionSchema>>
  | ReadonlyDeep<z.input<CollectionSchemaZod<TCollectionSchema>>>

export type SchemaDocumentOutput<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = TCollectionSchema['readonlyDocuments'] extends true
  ? ReadonlyDocumentOutput<CollectionSchemaZod<TCollectionSchema>, Options>
  : DocumentOutput<CollectionSchemaZod<TCollectionSchema>, Options>

export type SchemaReadCollectionReference<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = CollectionReference<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaReadDocumentReference<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = DocumentReference<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaReadCollectionGroup<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = CollectionGroup<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaWriteCollectionReference<TCollectionSchema extends CollectionSchema> = CollectionReference<
  SchemaDocumentInput<TCollectionSchema>,
  SchemaDocumentInput<TCollectionSchema>
>

export type SchemaWriteDocumentReference<TCollectionSchema extends CollectionSchema> = DocumentReference<
  SchemaDocumentInput<TCollectionSchema>,
  SchemaDocumentInput<TCollectionSchema>
>
