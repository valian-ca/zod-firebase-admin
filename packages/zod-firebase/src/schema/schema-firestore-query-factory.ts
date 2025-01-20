import { type AggregateSpec, getAggregateFromServer, getDocs } from '@firebase/firestore'

import { type MetaOutputOptions } from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import { type CollectionSchema, type SchemaFirestoreQueryFactory, type SchemaQuery } from './types'

export const schemaFirestoreQueryFactory = <TCollectionSchema extends CollectionSchema>(
  queryBuilder: <Options extends MetaOutputOptions>(options?: Options) => SchemaQuery<TCollectionSchema, Options>,
): SchemaFirestoreQueryFactory<TCollectionSchema> => ({
  prepare: (query, options) => applyQuerySpecification(queryBuilder(options), query),
  query: <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) =>
    getDocs(applyQuerySpecification(queryBuilder(options), query)),
  aggregateFromServer: async <AggregateSpecType extends AggregateSpec>(
    query: QuerySpecification,
    aggregateSpec: AggregateSpecType,
  ) => {
    const snapshot = await getAggregateFromServer(queryBuilder(), aggregateSpec)
    return snapshot.data()
  },
  findMany: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    return snapshot.docs.map((doc) => doc.data())
  },
  findUnique: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await getDocs(applyQuerySpecification(queryBuilder(options), query))
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
