import {
  connectFirestoreEmulator,
  doc,
  type DocumentData,
  getFirestore,
  increment,
  queryEqual,
  setDoc,
  Timestamp,
} from '@firebase/firestore'
import { initializeApp } from 'firebase/app'
import functionsTest from 'firebase-functions-test'
import { nanoid } from 'nanoid'
import { z, ZodError } from 'zod'

import { type Collections, collectionsBuilder } from '../src'

jest.unmock('@firebase/firestore')

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

const testHelper = functionsTest()

describe('collectionsBuilder', () => {
  let collection: Collections<typeof schema>
  beforeAll(() => {
    const app = initializeApp({ projectId: 'demo-zod-firebase' })
    connectFirestoreEmulator(getFirestore(app), 'localhost', 8080)
    collection = collectionsBuilder(schema)
  })

  afterEach(() => testHelper.firestore.clearFirestoreData({ projectId: 'demo-zod-firebase' }))

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
      const foo = `foo$-${nanoid()}`
      await expect(collection.test(foo).sub.findOrThrow()).rejects.toThrow()

      await collection.test(foo).sub.set({ value: 42 }, { merge: false })

      const foo42 = await collection.test(foo).sub.findOrThrow({ _metadata: true })

      expect(foo42._id).toBe(collection.test.sub.singleDocumentKey)
      expect(foo42.value).toBe(42)

      await collection.test(foo).sub.update({ value: increment(1) })
    })
  })

  describe('for test multiDocumentKey subCollection', () => {
    it('should provide CRUD', async () => {
      await collection.test('foo').multi.set('bar', { value: 42 })

      const foobar42 = await collection.test('foo').multi.findByIdOrThrow('bar')

      expect(foobar42._id).toBe('bar')
      expect(foobar42.value).toBe(42)
      expect(foobar42.name).toBe('default')

      await collection.test('foo').multi.set('bar', { name: 'bar' }, { merge: true })

      const bar = await collection.test('foo').multi.findByIdOrThrow('bar')

      expect(bar.name).toBe('bar')
    })

    it('should provide collection group query', async () => {
      await collection.test('foo').multi.set('bar', { value: 41 })
      await collection.test('bar').multi.set('foo', { value: 42 })

      const all = await collection.test.multi.group.findMany({ name: 'all' })

      expect(all).toHaveLength(2)
    })

    it('should provide collection for subSubCollection', async () => {
      await collection.test('foo').multi('test').subSub.set('bar', { value: 41 })
      await collection.test('bar').multi('test2').subSub.set('foo', { value: 42 })

      const all = await collection.test.multi.subSub.group.findMany({ name: 'all' })

      expect(all).toHaveLength(2)
    })
  })

  describe('test withId collection', () => {
    beforeEach(async () => {
      await setDoc(doc(getFirestore(), 'withId/foo'), { name1: 'foo' })
      await setDoc(doc(getFirestore(), 'withId/bar'), { name2: 'foo' })
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
      await collectionWithErrorHandler.test.set('bar', { value: 41 } as any)
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
      await collection.timestampTransform.set('bar', {
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
      ).resolves.toMatchObject({
        timestamp: NOW,
        sub: { timestamp: NOW },
      })
    })
  })

  describe('readonlyDocuments', () => {
    beforeEach(async () => {
      await setDoc(doc(getFirestore(), 'test/foo'), {
        name: 'foo',
        values: ['foo'],
      })
      await setDoc(doc(getFirestore(), 'test/bar'), { name: 'bar' })
      await setDoc(doc(getFirestore(), 'readOnly/foo'), {
        name: 'foo',
        values: ['foo'],
      })
      await setDoc(doc(getFirestore(), 'readOnly/bar'), { name: 'bar' })
    })

    it('should work', async () => {
      const readOnlyFoo = await collection.readOnly.findByIdOrThrow('foo')
      const readOnlyBar = await collection.test.findByIdOrThrow('bar', { readonly: true })

      await expect(collection.test.set('foo', readOnlyFoo)).resolves.not.toThrow()
      await expect(collection.test.set('test', readOnlyFoo)).resolves.not.toThrow()
      await expect(collection.test.add(readOnlyFoo)).resolves.not.toThrow()

      await expect(collection.readOnly.set('foo', readOnlyBar)).resolves.not.toThrow()
      await expect(collection.readOnly.set('test', readOnlyBar)).resolves.not.toThrow()
      await expect(collection.readOnly.add(readOnlyBar)).resolves.not.toThrow()
    })
  })

  describe('prepare query', () => {
    it('should return the same query', () => {
      expect(queryEqual(collection.test.prepare({ name: 'foo' }), collection.test.prepare({ name: 'foo' }))).toBe(true)
      expect(
        queryEqual(
          collection.test.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
          collection.test.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
        ),
      ).toBe(true)

      expect(
        queryEqual(
          collection.test.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
          collection.test.prepare({
            name: 'foo',
            where: [['name', '!=', 'foo']],
          }),
        ),
      ).toBe(false)

      expect(
        queryEqual(
          collection.test.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
          collection.test.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
        ),
      ).toBe(true)

      expect(
        queryEqual(
          collection.test.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
          collection.test.prepare({
            name: 'foo',
            orderBy: [['name', 'desc']],
          }),
        ),
      ).toBe(false)
    })

    it('should return the same query sub-collection', () => {
      expect(
        queryEqual(
          collection.test('bar').multi.prepare({ name: 'foo multi' }),
          collection.test('bar').multi.prepare({ name: 'foo multi' }),
        ),
      ).toBe(true)
      expect(
        queryEqual(
          collection.test('bar').multi.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
          collection.test('bar').multi.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
        ),
      ).toBe(true)

      expect(
        queryEqual(
          collection.test('bar').multi.prepare({
            name: 'foo',
            where: [['name', '==', 'foo']],
          }),
          collection.test('bar').multi.prepare({
            name: 'foo',
            where: [['name', '!=', 'foo']],
          }),
        ),
      ).toBe(false)

      expect(
        queryEqual(
          collection.test('bar').multi.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
          collection.test('bar').multi.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
        ),
      ).toBe(true)

      expect(
        queryEqual(
          collection.test('bar').multi.prepare({
            name: 'foo',
            orderBy: [['name', 'asc']],
          }),
          collection.test('bar').multi.prepare({
            name: 'foo',
            orderBy: [['name', 'desc']],
          }),
        ),
      ).toBe(false)
    })
  })
})
