import type { DocumentData, Query, QuerySnapshot } from 'firebase-admin/firestore'

import type { QuerySpecification } from './query-specification'

export type QueryHelper<T extends DocumentData = DocumentData> = {
  prepare(query: QuerySpecification): Query<T>
  query(query: QuerySpecification): Promise<QuerySnapshot<T>>

  count(query: QuerySpecification): Promise<number>

  findMany(query: QuerySpecification): Promise<Array<T>>

  findUnique(query: QuerySpecification): Promise<T | null>
  findUniqueOrThrow(query: QuerySpecification): Promise<T>

  findFirst(query: QuerySpecification): Promise<T | null>
  findFirstOrThrow(query: QuerySpecification): Promise<T>
}

export const queryHelper = <T extends DocumentData = DocumentData>(
  queryFactory: (querySpecification: QuerySpecification) => Query<T>,
): QueryHelper<T> => ({
  prepare: (query) => queryFactory(query),
  query: (query) => queryFactory(query).get(),
  count: async (query) => {
    const snapshot = await queryFactory(query).count().get()
    return snapshot.data().count
  },
  findMany: async (query) => {
    const snapshot = await queryFactory(query).get()
    return snapshot.docs.map((doc) => doc.data())
  },
  findUnique: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
