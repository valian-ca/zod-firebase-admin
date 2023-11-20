import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
// eslint-disable-next-line import/no-extraneous-dependencies
import functionsTest from 'firebase-functions-test'
import { z } from 'zod'

import { collectionsBuilder } from '../collection-builder'

jest.unmock('firebase-admin/firestore')

const TestDocumentZod = z.object({
  name: z.string(),
})

const TestSubCollectionDocumentZod = z.object({
  value: z.number(),
})

const TestSubMultiCollectionDocumentZod = z.object({
  value: z.number(),
  name: z.string().optional().default('default'),
})

const WithIdDocumentZod = z.discriminatedUnion('_id', [
  z.object({
    _id: z.literal('foo'),
    name1: z.string(),
  }),
  z.object({
    _id: z.literal('bar'),
    name2: z.string(),
  }),
])

const schema = {
  test: {
    zod: TestDocumentZod,
    sub: {
      zod: TestSubCollectionDocumentZod,
      singleDocumentKey: 'KEY',
    },
    multi: { zod: TestSubMultiCollectionDocumentZod },
  },
  withId: {
    zod: WithIdDocumentZod,
    includeDocumentIdForZod: true,
  },
}

const collection = collectionsBuilder(schema)
const testHelper = functionsTest()

describe('collectionsBuilder', () => {
  beforeAll(() => {
    initializeApp({ projectId: 'demo-tests' })
  })

  afterEach(() => testHelper.firestore.clearFirestoreData({ projectId: 'demo-tests' }))

  afterAll(() => {
    testHelper.cleanup()
  })

  describe('for test collection', () => {
    it('should provide CRUD', async () => {
      await expect(collection.test.findByIdOrThrow('NOT_AN_DOCUMENT')).rejects.toThrow()

      const documentRef = await collection.test.add({ name: 'foo' })

      const foo = await collection.test.findByIdOrThrow(documentRef.id)

      expect(foo._id).toBe(documentRef.id)
      expect(foo.name).toBe('foo')

      await collection.test.update(documentRef.id, { name: 'bar' })

      const bar = await collection.test.findByIdOrThrow(documentRef.id)

      expect(bar._id).toBe(documentRef.id)
      expect(bar.name).toBe('bar')

      await collection.test.delete(documentRef.id)

      await expect(collection.test.findById(documentRef.id)).resolves.toBeUndefined()
    })
  })

  describe('for test singleDocumentKey subCollection', () => {
    it('should provide CRUD', async () => {
      await expect(collection.test('foo').sub.findOrThrow()).rejects.toThrow()

      await collection.test('foo').sub.set({ value: 42 }, { merge: false })

      const foo42 = await collection.test('foo').sub.findOrThrow()

      expect(foo42._id).toBe(collection.test.sub.singleDocumentKey)
      expect(foo42.value).toBe(42)

      await collection.test('foo').sub.update({ value: FieldValue.increment(1) }, { lastUpdateTime: foo42._updateTime })

      await expect(
        collection.test('foo').sub.update({ value: FieldValue.increment(1) }, { lastUpdateTime: foo42._updateTime }),
      ).rejects.toThrow()
    })
  })

  describe('for test multiDocumentKey subCollection', () => {
    it('should provide CRUD', async () => {
      await collection.test('foo').multi.create('bar', { value: 42 })

      const foobar42 = await collection.test('foo').multi.findByIdOrThrow('bar')

      expect(foobar42._id).toBe('bar')
      expect(foobar42.value).toBe(42)
      expect(foobar42.name).toBe('default')

      await collection.test('foo').multi.set('bar', { name: 'bar' }, { merge: true })

      const newBar = await collection.test('foo').multi.findByIdOrThrow('bar')

      expect(newBar.name).toBe('bar')
    })

    it('should provide collection group query', async () => {
      await collection.test('foo').multi.create('bar', { value: 41 })
      await collection.test('bar').multi.create('foo', { value: 42 })

      const count = await collection.test.multi.group.count({ name: 'all' })

      expect(count).toBe(2)
    })
  })

  describe('test withId collection', () => {
    beforeEach(async () => {
      await getFirestore().doc('withId/foo').set({ name1: 'foo' })
      await getFirestore().doc('withId/bar').set({ name2: 'foo' })
    })

    it('query', async () => {
      const documents = await collection.withId.findMany({ name: 'all' })

      expect(documents).toHaveLength(2)
    })
  })
})
