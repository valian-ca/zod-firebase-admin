import {
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from 'firebase-admin/firestore'

import { type MetaOutputOptions } from '../../base'
import { type QuerySpecification } from '../../query'

import { type SchemaDocumentInput, type SchemaDocumentOutput } from './doc'
import { type CollectionSchema } from './schema'

export type SchemaQuery<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = Query<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaQuerySnapshot<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = QuerySnapshot<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaDocumentSnapshot<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = DocumentSnapshot<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaQueryDocumentSnapshot<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = QueryDocumentSnapshot<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export interface SchemaFirestoreQueryFactory<TCollectionSchema extends CollectionSchema> {
  readonly collectionName: string

  prepare<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): SchemaQuery<TCollectionSchema, Options>

  query<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaQuerySnapshot<TCollectionSchema, Options>>

  count(query: QuerySpecification): Promise<number>

  findMany<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<Array<SchemaDocumentOutput<TCollectionSchema, Options>>>

  findUnique<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | null>

  findUniqueOrThrow<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>

  findFirst<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | null>

  findFirstOrThrow<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>
}
