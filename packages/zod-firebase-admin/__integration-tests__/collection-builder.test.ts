import { initializeApp } from 'firebase-admin/app'
import { type DocumentData, FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import functionsTest from 'firebase-functions-test'
import { z, ZodError } from 'zod'

import { collectionsBuilder } from '../src'

jest.unmock('firebase-admin/firestore')

const TestDocumentZod = z.object({
  name: z.string(),
  values: z.array(z.string()).optional().default([]),
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

const TimestampTransformZod = z.object({
  timestamp: z.date(),
  value: z.string(),
  number: z.number(),
  sub: z.object({
    value: z.string(),
    number: z.number(),
    timestamp: z.date(),
  }),
})

const schema = {
  test: {
    zod: TestDocumentZod,
    sub: {
      zod: TestSubCollectionDocumentZod,
      singleDocumentKey: 'KEY',
    },
    multi: {
      zod: TestSubMultiCollectionDocumentZod,
      subSub: {
        zod: TestSubCollectionDocumentZod,
      },
    },
  },
  withId: {
    zod: WithIdDocumentZod,
    includeDocumentIdForZod: true,
  },
  timestampTransform: {
    zod: TimestampTransformZod,
  },
  readOnly: {
    zod: TestDocumentZod,
    readonlyDocuments: true,
  },
} as const

const collection = collectionsBuilder(schema)
const testHelper = functionsTest()

describe('collectionsBuilder', () => {
  beforeAll(() => {
    initializeApp({ projectId: 'demo-firebase-admin-zod' })
  })

  afterEach(() => testHelper.firestore.clearFirestoreData({ projectId: 'demo-firebase-admin-zod' }))

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

      const foo42 = await collection.test('foo').sub.findOrThrow({ _updateTime: true })

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

      const bar = await collection.test('foo').multi.findByIdOrThrow('bar')

      expect(bar.name).toBe('bar')
    })

    it('should provide collection group query', async () => {
      await collection.test('foo').multi.create('bar', { value: 41 })
      await collection.test('bar').multi.create('foo', { value: 42 })

      const count = await collection.test.multi.group.count({ name: 'all' })

      expect(count).toBe(2)
    })

    it('should provide collection for subSubCollection', async () => {
      await collection.test('foo').multi('test').subSub.create('bar', { value: 41 })
      await collection.test('bar').multi('test2').subSub.create('foo', { value: 42 })

      const count = await collection.test.multi.subSub.group.count({ name: 'all' })

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

  describe('zodErrorHandler', () => {
    const collectionWithErrorHandler = collectionsBuilder(schema, {
      zodErrorHandler: (error, snapshot) => new Error(`zodError ${snapshot.id}`),
    })

    beforeEach(async () => {
      // insert an invalid document
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await collectionWithErrorHandler.test.create('bar', { value: 41 } as any)
    })

    it('should handle error with error converter', async () => {
      await expect(() => collectionWithErrorHandler.test.findByIdOrThrow('bar')).rejects.toThrow('zodError bar')
    })
  })

  describe('snapshotDataConverter', () => {
    const NOW = new Date()

    const handleTimestamp = (document: DocumentData): DocumentData =>
      Object.fromEntries(
        Object.entries(document).map(([key, value]) => {
          switch (true) {
            case value instanceof Timestamp:
              return [key, value.toDate()]
            case value instanceof Object:
              return [key, handleTimestamp(value)]
            default:
              return [key, value]
          }
        }),
      )

    const collectionWithSnapshotDataConverter = collectionsBuilder(schema, {
      snapshotDataConverter: (snapshot) => handleTimestamp(snapshot.data()),
    })

    beforeEach(async () => {
      await collection.timestampTransform.create('bar', {
        timestamp: NOW,
        value: 'foo',
        number: 42,
        sub: {
          value: 'foo',
          number: 42,
          timestamp: NOW,
        },
      })
    })

    it('should convert date', async () => {
      await expect(collection.timestampTransform.findByIdOrThrow('bar')).rejects.toThrow(ZodError)

      await expect(
        collectionWithSnapshotDataConverter.timestampTransform.findByIdOrThrow('bar'),
      ).resolves.toMatchObject({ timestamp: NOW, sub: { timestamp: NOW } })
    })
  })

  describe('readonlyDocuments', () => {
    beforeEach(async () => {
      await getFirestore()
        .doc('test/foo')
        .set({ name: 'foo', values: ['foo'] })
      await getFirestore().doc('test/bar').set({ name: 'bar' })
      await getFirestore()
        .doc('readOnly/foo')
        .set({ name: 'foo', values: ['foo'] })
      await getFirestore().doc('readOnly/bar').set({ name: 'bar' })
    })

    it('should work', async () => {
      const readOnlyFoo = await collection.readOnly.findByIdOrThrow('foo')
      const readOnlyBar = await collection.test.findByIdOrThrow('bar', { readonly: true })

      await expect(collection.test.set('foo', readOnlyFoo)).resolves.not.toThrow()
      await expect(collection.test.create('test', readOnlyFoo)).resolves.not.toThrow()
      await expect(collection.test.add(readOnlyFoo)).resolves.not.toThrow()

      await expect(collection.readOnly.set('foo', readOnlyBar)).resolves.not.toThrow()
      await expect(collection.readOnly.create('test', readOnlyBar)).resolves.not.toThrow()
      await expect(collection.readOnly.add(readOnlyBar)).resolves.not.toThrow()
    })
  })
})
