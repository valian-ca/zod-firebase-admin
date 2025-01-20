import { type DocumentData, type Query, type QueryDocumentSnapshot, type QuerySnapshot } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { type DeepPartial } from 'ts-essentials'

import { applyQuerySpecification } from '../../query'
import { schemaFirestoreQueryFactory } from '../schema-firestore-query-factory'

jest.mock('../../query')

jest.mocked(applyQuerySpecification).mockImplementation((query) => query)

function mockedQueryBuilder<T extends DocumentData = DocumentData>(querySnapshot?: DeepPartial<QuerySnapshot<T>>) {
  const firestoreQuerySnapshot = mock<QuerySnapshot<T>>(querySnapshot)
  const firestoreQuery = mock<Query<T>>()
  firestoreQuery.get.mockResolvedValue(firestoreQuerySnapshot)
  return jest.fn().mockReturnValue(firestoreQuery)
}

describe('schemaFirestoreQueryFactory', () => {
  describe('prepare', () => {
    it('prepare a firebase query', () => {
      const firestoreQuery = mock<Query>()
      const queryBuilder = jest.fn().mockReturnValue(firestoreQuery)

      schemaFirestoreQueryFactory(queryBuilder).prepare({ name: 'test' })

      expect(applyQuerySpecification).toHaveBeenCalledWith(firestoreQuery, { name: 'test' })

      expect(queryBuilder).toHaveBeenCalledWith(undefined)
    })

    it('prepare a firebase query with options', () => {
      const firestoreQuery = mock<Query>()
      const queryBuilder = jest.fn().mockReturnValue(firestoreQuery)

      schemaFirestoreQueryFactory(queryBuilder).prepare({ name: 'test' }, { _id: false })

      expect(applyQuerySpecification).toHaveBeenCalledWith(firestoreQuery, { name: 'test' })

      expect(queryBuilder).toHaveBeenCalledWith({ _id: false })
    })
  })

  describe('query', () => {
    it('returns the query snapshot', async () => {
      const queryBuilder = mockedQueryBuilder()
      await schemaFirestoreQueryFactory(queryBuilder).query({ name: 'test' })

      expect(queryBuilder().get).toHaveBeenCalled()
    })
  })

  describe('count', () => {
    it('returns the query snapshot', async () => {
      const firestoreQuery = mock<Query>()
      const firestoreAggregateQuery = mock<ReturnType<(typeof firestoreQuery)['count']>>()
      const firestoreAggregateQuerySnapshot = mock<Awaited<ReturnType<(typeof firestoreAggregateQuery)['get']>>>({
        data: jest.fn().mockReturnValue({ count: 1 }),
      })
      firestoreAggregateQuery.get.mockResolvedValue(firestoreAggregateQuerySnapshot)
      firestoreQuery.count.mockReturnValue(firestoreAggregateQuery)
      const queryBuilder = jest.fn().mockReturnValue(firestoreQuery)
      await expect(schemaFirestoreQueryFactory(queryBuilder).count({ name: 'test' })).resolves.toBe(1)
    })
  })

  describe('findMany', () => {
    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryBuilder = mockedQueryBuilder({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaFirestoreQueryFactory(queryBuilder).findMany({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).toHaveBeenCalled()
    })
  })

  describe('findUnique', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 2,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findUnique({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('returns null when the query returns no documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 0,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findUnique({ name: 'test' })).resolves.toBeNull()
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryBuilder = mockedQueryBuilder({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await schemaFirestoreQueryFactory(queryBuilder).findUnique({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findUniqueOrThrow', () => {
    it('throw when the query returns multiple documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 2,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned more than one document',
      )
    })

    it('throw when the query returns no documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 0,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findUniqueOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned no documents',
      )
    })

    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot = mock<QueryDocumentSnapshot>()
      const queryBuilder = mockedQueryBuilder({
        size: 1,
        docs: [queryDocumentSnapshot],
      })
      await schemaFirestoreQueryFactory(queryBuilder).findUniqueOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot.data).toHaveBeenCalled()
    })
  })

  describe('findFirst', () => {
    it('returns null when the query returns no documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 0,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findFirst({ name: 'test' })).resolves.toBeNull()
    })

    it('returns only the first document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryBuilder = mockedQueryBuilder({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaFirestoreQueryFactory(queryBuilder).findFirst({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })

  describe('findFirstOrThrow', () => {
    it('throw when the query returns no documents', async () => {
      const queryBuilder = mockedQueryBuilder({
        size: 0,
      })
      await expect(schemaFirestoreQueryFactory(queryBuilder).findFirstOrThrow({ name: 'test' })).rejects.toThrow(
        'Query test returned no documents',
      )
    })

    it('returns only the first document data', async () => {
      const queryDocumentSnapshot1 = mock<QueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<QueryDocumentSnapshot>()
      const queryBuilder = mockedQueryBuilder({
        size: 2,
        docs: [queryDocumentSnapshot1, queryDocumentSnapshot2],
      })
      await schemaFirestoreQueryFactory(queryBuilder).findFirstOrThrow({ name: 'test' })

      expect(queryDocumentSnapshot1.data).toHaveBeenCalled()
      expect(queryDocumentSnapshot2.data).not.toHaveBeenCalled()
    })
  })
})
