import type { DocumentSnapshot, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore'

import type { MetaOutputOptions } from '../base'
import type { QuerySpecification } from '../query'

import type { CollectionSchema, SchemaDocumentInput, SchemaDocumentOutput } from './types'

export type SchemaQuery<TCollectionSchema extends CollectionSchema, Options extends MetaOutputOptions> = Query<
  SchemaDocumentOutput<TCollectionSchema, Options>,
  SchemaDocumentInput<TCollectionSchema>
>

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

export interface SchemaQueryHelper<TCollectionSchema extends CollectionSchema> {
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

export const schemaQueryHelper = <TCollectionSchema extends CollectionSchema>(
  queryFactory: <Options extends MetaOutputOptions>(
    querySpecification: QuerySpecification,
    options?: Options,
  ) => SchemaQuery<TCollectionSchema, Options>,
): SchemaQueryHelper<TCollectionSchema> => ({
  prepare: (query, options) => queryFactory(query, options),
  query: <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) =>
    queryFactory(query, options).get(),
  count: async (query) => {
    const snapshot = await queryFactory(query).count().get()
    return snapshot.data().count
  },
  findMany: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await queryFactory(query, options).get()
    return snapshot.docs.map((doc) => doc.data())
  },
  findUnique: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await queryFactory(query, options).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await queryFactory(query, options).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await queryFactory(query, options).get()
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await queryFactory(query, options).get()
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
