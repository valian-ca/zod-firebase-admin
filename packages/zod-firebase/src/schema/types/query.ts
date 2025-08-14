import {
  type AggregateSpec,
  type AggregateSpecData,
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from '@firebase/firestore'

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

export type SchemaQuerySpecification<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = QuerySpecification<SchemaDocumentOutput<TCollectionSchema, TOptions>, SchemaDocumentInput<TCollectionSchema>>

export interface SchemaFirestoreQueryFactory<TCollectionSchema extends CollectionSchema> {
  readonly collectionName: string

  prepare<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): SchemaQuery<TCollectionSchema, TOptions>

  query<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<SchemaQuerySnapshot<TCollectionSchema, TOptions>>

  aggregateFromServer<AggregateSpecType extends AggregateSpec>(
    query: QuerySpecification,
    aggregateSpec: AggregateSpecType,
  ): Promise<AggregateSpecData<AggregateSpecType>>

  findMany<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<Array<SchemaDocumentOutput<TCollectionSchema, TOptions>>>

  findUnique<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, TOptions> | null>

  findUniqueOrThrow<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, TOptions>>

  findFirst<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, TOptions> | null>

  findFirstOrThrow<TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, TOptions>>
}
