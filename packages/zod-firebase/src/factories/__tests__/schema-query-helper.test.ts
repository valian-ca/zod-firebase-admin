import {
  type AggregateQuerySnapshot,
  count,
  type DocumentData,
  getAggregateFromServer,
  getDocs,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import type { DeepPartial } from 'ts-essentials'

import { schemaQueryHelper } from '../schema-query-helper'

function mockedQueryFactory<T extends DocumentData = DocumentData>(querySnapshot?: DeepPartial<QuerySnapshot<T>>) {
  const firestoreQuerySnapshot = mock<QuerySnapshot<T>>(querySnapshot)
  const firestoreQuery = mock<Query<T>>()
  jest.mocked(getDocs).mockResolvedValue(firestoreQuerySnapshot)
  return jest.fn().mockReturnValue(firestoreQuery)
}

describe('schemaQueryHelper', () => {
  describe('prepare', () => {
    it('prepare a firebase query', () => {
      const queryFactory = mockedQueryFactory()
      schemaQueryHelper(queryFactory).prepare({ name: 'test' })

      expect(queryFactory).toHaveBeenCalledWith({ name: 'test' }, undefined)
    })

    it('prepare a firebase query with options', () => {
      const queryFactory = mockedQueryFactory()
      schemaQueryHelper(queryFactory).prepare({ name: 'test' }, { _id: false })

      expect(queryFactory).toHaveBeenCalledWith({ name: 'test' }, { _id: false })
    })
  })

  describe('query', () => {
    it('returns the query snapshot', async () => {
      const queryFactory = mockedQueryFactory()
      await schemaQueryHelper(queryFactory).query({ name: 'test' })

      expect(getDocs).toHaveBeenCalled()
    })
  })

  describe('aggregateFromServer', () => {
    it('returns the query snapshot', async () => {
      const aggregateSpec = { count: count() }
      const snapshot = mock<AggregateQuerySnapshot<typeof aggregateSpec>>()
      jest.mocked(getAggregateFromServer).mockResolvedValue(snapshot)

      const firestoreQuery = mock<Query>()
      const queryFactory = jest.fn().mockReturnValue(firestoreQuery)

      await schemaQueryHelper(queryFactory).aggregateFromServer({ name: 'test' }, aggregateSpec)

      expect(getAggregateFromServer).toHaveBeenCalled()
    })
  })

  describe('findMany', () => {
    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaQueryHelper(queryFactory).findMany({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).toHaveBeenCalled()
    })
  })

  describe('findUnique', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 2,
      })
      await expect(schemaQueryHelper(queryFactory).findUnique({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('returns null when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(schemaQueryHelper(queryFactory).findUnique({ name: 'test' })).resolves.toBeNull()
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await schemaQueryHelper(queryFactory).findUnique({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findUniqueOrThrow', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 2,
      })
      await expect(schemaQueryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('throw when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(schemaQueryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned no documents',
      )
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await schemaQueryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findFirst', () => {
    it('returns null when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(schemaQueryHelper(queryFactory).findFirst({ name: 'test' })).resolves.toBeNull()
    })

    it('returns only the first document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaQueryHelper(queryFactory).findFirst({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })

  describe('findFirstOrThrow', () => {
    it('throw when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(schemaQueryHelper(queryFactory).findFirstOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned no documents',
      )
    })

    it('returns only the first document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaQueryHelper(queryFactory).findFirstOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })
})
