import { type AggregateSpec, getAggregateFromServer, getDocs } from '@firebase/firestore'

import { type MetaOutputOptions } from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import {
  type CollectionSchema,
  type SchemaFirestoreQueryFactory,
  type SchemaQuery,
  type SchemaQuerySpecification,
} from './types'

export const schemaFirestoreQueryFactory = <TCollectionSchema extends CollectionSchema>(
  queryBuilder: <TOptions extends MetaOutputOptions>(options?: TOptions) => SchemaQuery<TCollectionSchema, TOptions>,
  collectionName: string,
): SchemaFirestoreQueryFactory<TCollectionSchema> => ({
  collectionName,
  prepare: <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => applyQuerySpecification(queryBuilder(options), query),
  query: <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => getDocs(applyQuerySpecification(queryBuilder(options), query)),
  aggregateFromServer: async <AggregateSpecType extends AggregateSpec>(
    query: QuerySpecification,
    aggregateSpec: AggregateSpecType,
  ) => {
    const snapshot = await getAggregateFromServer(queryBuilder(), aggregateSpec)
    return snapshot.data()
  },
  findMany: async <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    return snapshot.docs.map((doc) => doc.data())
  },
  findUnique: async <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async <TOptions extends MetaOutputOptions>(
    query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
    options?: TOptions,
  ) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
