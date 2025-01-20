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

export interface SchemaFirestoreQueryFactory<TCollectionSchema extends CollectionSchema> {
  prepare<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): SchemaQuery<TCollectionSchema, Options>

  query<Options extends MetaOutputOptions>(
    query: QuerySpecification,
    options?: Options,
  ): Promise<SchemaQuerySnapshot<TCollectionSchema, Options>>

  aggregateFromServer<AggregateSpecType extends AggregateSpec>(
    query: QuerySpecification,
    aggregateSpec: AggregateSpecType,
  ): Promise<AggregateSpecData<AggregateSpecType>>

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
