import { getFirestore, type Query } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import type { DeepPartial } from 'ts-essentials'
import { z } from 'zod'

import type { MetaOutputOptions } from '../../base'
import {
  type SchemaQuery,
  type SchemaQueryDocumentSnapshot,
  schemaQueryHelper,
  type SchemaQuerySnapshot,
} from '../schema-query-helper'
import type { CollectionSchema } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SCHEMA = {
  zod: TestDocumentZod,
}

type Schema = typeof SCHEMA
type TestQueryDocumentSnapshot = SchemaQueryDocumentSnapshot<Schema>

function mockedQueryFactory<
  TCollectionSchema extends CollectionSchema = Schema,
  Options extends MetaOutputOptions = MetaOutputOptions,
>(querySnapshot?: DeepPartial<SchemaQuerySnapshot<TCollectionSchema, Options>>) {
  const firestoreQuerySnapshot = mock<SchemaQuerySnapshot<TCollectionSchema, Options>>(querySnapshot)
  const firestoreQuery = mock<SchemaQuery<TCollectionSchema, Options>>()
  firestoreQuery.get.mockResolvedValue(firestoreQuerySnapshot)
  return jest.fn().mockReturnValue(firestoreQuery)
}

describe('schemaQueryHelper', () => {
  describe('prepare', () => {
    it('returns the query that can be used in transactions', async () => {
      const queryFactory = mockedQueryFactory()
      const query = schemaQueryHelper(queryFactory).prepare({ name: 'test' })

      expect(queryFactory).toHaveBeenCalledWith({ name: 'test' }, undefined)
      expect(queryFactory().get).not.toHaveBeenCalled()

      await getFirestore().runTransaction(async (transaction) => transaction.get(query))
    })

    it('returns the query that can be used in transactions with specified options', async () => {
      const queryFactory = mockedQueryFactory()
      const query = schemaQueryHelper(queryFactory).prepare({ name: 'test' }, { _id: false })

      expect(queryFactory).toHaveBeenCalledWith({ name: 'test' }, { _id: false })
      expect(queryFactory().get).not.toHaveBeenCalled()

      await getFirestore().runTransaction(async (transaction) => transaction.get(query))
    })
  })

  describe('query', () => {
    it('returns the query snapshot', async () => {
      const queryFactory = mockedQueryFactory()
      await schemaQueryHelper(queryFactory).query({ name: 'test' })

      expect(queryFactory().get).toHaveBeenCalled()
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
      const queryFactory = jest.fn().mockReturnValue(firestoreQuery)
      await expect(schemaQueryHelper(queryFactory).count({ name: 'test' })).resolves.toBe(1)
    })
  })

  describe('findMany', () => {
    it('returns the the uniq document data', async () => {
      const queryDocumentSnapshot1 = mock<TestQueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<TestQueryDocumentSnapshot>()
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
      const queryDocumentSnapshot = mock<TestQueryDocumentSnapshot>()
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
      const queryDocumentSnapshot = mock<TestQueryDocumentSnapshot>()
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
      const queryDocumentSnapshot1 = mock<TestQueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<TestQueryDocumentSnapshot>()
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
      const queryDocumentSnapshot1 = mock<TestQueryDocumentSnapshot>()
      const queryDocumentSnapshot2 = mock<TestQueryDocumentSnapshot>()
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
