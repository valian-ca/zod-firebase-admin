import type { DocumentData, Query, QuerySnapshot } from 'firebase-admin/firestore'

import type { QuerySpecification } from './query-specification'

export interface QueryHelper<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  prepare(query: QuerySpecification): Query<AppModelType, DbModelType>
  query(query: QuerySpecification): Promise<QuerySnapshot<AppModelType, DbModelType>>

  count(query: QuerySpecification): Promise<number>

  findMany(query: QuerySpecification): Promise<AppModelType[]>

  findUnique(query: QuerySpecification): Promise<AppModelType | null>
  findUniqueOrThrow(query: QuerySpecification): Promise<AppModelType>

  findFirst(query: QuerySpecification): Promise<AppModelType | null>
  findFirstOrThrow(query: QuerySpecification): Promise<AppModelType>
}

export const findFirst = <AppModelType, DatabaseModelType extends DocumentData>(
  snapshot: QuerySnapshot<AppModelType, DatabaseModelType>,
) => {
  const [doc] = snapshot.docs
  return doc?.data() ?? null
}

export const queryHelper = <AppModelType, DbModelType extends DocumentData>(
  queryFactory: (querySpecification: QuerySpecification) => Query<AppModelType, DbModelType>,
): QueryHelper<AppModelType, DbModelType> => ({
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
    return findFirst(snapshot)
  },
  findUniqueOrThrow: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return findFirst(snapshot)!
  },
  findFirst: async (query) => {
    const snapshot = await queryFactory(query).get()
    return findFirst(snapshot)
  },
  findFirstOrThrow: async (query) => {
    const snapshot = await queryFactory(query).get()
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return findFirst(snapshot)!
  },
})
