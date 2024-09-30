import { type DocumentData, getDocs, type Query, type QuerySnapshot } from 'firebase/firestore'

import { type QuerySpecification } from './query-specification'

export interface QueryHelper<AppModelType = DocumentData, DatabaseModelType extends DocumentData = DocumentData> {
  prepare(query: QuerySpecification): Query<AppModelType, DatabaseModelType>
  query(query: QuerySpecification): Promise<QuerySnapshot<AppModelType, DatabaseModelType>>

  findMany(query: QuerySpecification): Promise<AppModelType[]>

  findUnique(query: QuerySpecification): Promise<AppModelType | null>
  findUniqueOrThrow(query: QuerySpecification): Promise<AppModelType>

  findFirst(query: QuerySpecification): Promise<AppModelType | null>
  findFirstOrThrow(query: QuerySpecification): Promise<AppModelType>
}

export const queryHelper = <AppModelType, DatabaseModelType extends DocumentData>(
  queryFactory: (querySpecification: QuerySpecification) => Query<AppModelType, DatabaseModelType>,
): QueryHelper<AppModelType, DatabaseModelType> => ({
  prepare: (query) => queryFactory(query),
  query: (query) => getDocs(queryFactory(query)),
  findMany: async (query) => {
    const snapshot = await getDocs(queryFactory(query))
    return snapshot.docs.map((document) => document.data())
  },
  findUnique: async (query) => {
    const snapshot = await getDocs(queryFactory(query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findUniqueOrThrow: async (query) => {
    const snapshot = await getDocs(queryFactory(query))
    if (snapshot.size > 1) {
      throw new Error(`Query ${query.name} returned more than one document`)
    }
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
  findFirst: async (query) => {
    const snapshot = await getDocs(queryFactory(query))
    if (snapshot.size === 0) {
      return null
    }
    return snapshot.docs[0].data()
  },
  findFirstOrThrow: async (query) => {
    const snapshot = await getDocs(queryFactory(query))
    if (snapshot.size === 0) {
      throw new Error(`Query ${query.name} returned no documents`)
    }
    return snapshot.docs[0].data()
  },
})
