import {
  type DocumentData,
  getDocs,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { type DeepPartial } from 'ts-essentials'

import { queryHelper } from '../query-helper'

function mockedQueryFactory<T extends DocumentData = DocumentData>(querySnapshot?: DeepPartial<QuerySnapshot<T>>) {
  const firestoreQuerySnapshot = mock<QuerySnapshot<T>>(querySnapshot)
  const firestoreQuery = mock<Query<T>>()
  jest.mocked(getDocs).mockResolvedValue(firestoreQuerySnapshot)
  return jest.fn<Query<T>, []>().mockReturnValue(firestoreQuery)
}

describe('queryHelper', () => {
  describe('prepare', () => {
    it('prepare a firebase query', () => {
      const queryFactory = mockedQueryFactory()
      queryHelper(queryFactory).prepare({ name: 'test' })

      expect(queryFactory).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('query', () => {
    it('returns the query snapshot', async () => {
      const queryFactory = mockedQueryFactory()
      await queryHelper(queryFactory).query({ name: 'test' })

      expect(getDocs).toHaveBeenCalled()
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
      await queryHelper(queryFactory).findMany({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).toHaveBeenCalled()
    })
  })

  describe('findUnique', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 2,
      })
      await expect(queryHelper(queryFactory).findUnique({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('returns null when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(queryHelper(queryFactory).findUnique({ name: 'test' })).resolves.toBeNull()
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await queryHelper(queryFactory).findUnique({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findUniqueOrThrow', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 2,
      })
      await expect(queryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('throw when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(queryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned no documents',
      )
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await queryHelper(queryFactory).findUniqueOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findFirst', () => {
    it('returns null when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(queryHelper(queryFactory).findFirst({ name: 'test' })).resolves.toBeNull()
    })

    it('returns only the first document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryFactory = mockedQueryFactory({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await queryHelper(queryFactory).findFirst({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })

  describe('findFirstOrThrow', () => {
    it('throw when the query returns no documents', async () => {
      const queryFactory = mockedQueryFactory({
        size: 0,
      })
      await expect(queryHelper(queryFactory).findFirstOrThrow({ name: 'test' })).rejects.toThrow(
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
      await queryHelper(queryFactory).findFirstOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })
})
