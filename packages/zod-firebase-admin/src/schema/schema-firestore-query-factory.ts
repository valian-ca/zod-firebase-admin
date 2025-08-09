import { type MetaOutputOptions } from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import { type CollectionSchema, type SchemaFirestoreQueryFactory, type SchemaQuery } from './types'

export const schemaFirestoreQueryFactory = <TCollectionSchema extends CollectionSchema>(
  queryBuilder: <Options extends MetaOutputOptions>(options?: Options) => SchemaQuery<TCollectionSchema, Options>,
  collectionName: string,
): SchemaFirestoreQueryFactory<TCollectionSchema> => ({
  collectionName,
  prepare: (query, options) => applyQuerySpecification(queryBuilder(options), query),
  query: <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) =>
    applyQuerySpecification(queryBuilder(options), query).get(),
  count: async (query) => {
    const snapshot = await applyQuerySpecification(queryBuilder(), query).count().get()
    return snapshot.data().count
  },
  findMany: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await applyQuerySpecification(queryBuilder(options), query).get()
    return snapshot.docs.map((doc) => doc.data())
  },
  findUnique: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await applyQuerySpecification(queryBuilder(options), query).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await applyQuerySpecification(queryBuilder(options), query).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await applyQuerySpecification(queryBuilder(options), query).get()
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) => {
    const snapshot = await applyQuerySpecification(queryBuilder(options), query).get()
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
