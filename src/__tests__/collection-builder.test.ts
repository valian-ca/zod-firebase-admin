import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import { collectionsBuilder } from '../collection-builder'

// jest.mock('../factories/collection-factory')

const TestDocumentZod = z.object({
  name: z.string(),
})

const TestSubCollectionDocumentZod = z.object({
  value: z.number(),
})

const TestSubMultiCollectionDocumentZod = z.object({
  uudi: z.string(),
})

const WithIdDocumentZod = z.object({
  _id: z.string(),
})

const schema = {
  test: {
    zod: TestDocumentZod,
    sub: { zod: TestSubCollectionDocumentZod, singleDocumentKey: 'KEY' },
    multi: { zod: TestSubMultiCollectionDocumentZod },
  },
  withId: { zod: WithIdDocumentZod, includeDocumentIdForZod: true },
}

describe('collectionsBuilder', () => {
  it('should expose collectionPath', () => {
    const collection = collectionsBuilder(schema)

    expect(collection.test.collectionPath).toBe('test')
    expect(collection.test('id').sub.collectionPath).toEqual(['test', 'id', 'sub'].join('/'))
    expect(collection.test('id').multi.collectionPath).toEqual(['test', 'id', 'multi'].join('/'))
  })

  it('should expose schema', () => {
    const collection = collectionsBuilder(schema)

    expect(collection.test.zod).toBe(schema.test.zod)
    expect(collection.test.sub.zod).toBe(schema.test.sub.zod)
    expect(collection.test.sub.singleDocumentKey).toBe(schema.test.sub.singleDocumentKey)
    expect(collection.test.multi.zod).toBe(schema.test.multi.zod)
  })

  it('should expose collection names', () => {
    const collection = collectionsBuilder(schema)

    expect(collection.test.collectionName).toBe('test')
    expect(collection.test.sub.collectionName).toBe('sub')
    expect(collection.test.multi.collectionName).toBe('multi')
  })

  describe('with specified firestore factory', () => {
    const firestoreWrapper = jest.fn().mockImplementation(getFirestore)
    const collectionWithSpecifyFirestore = collectionsBuilder(schema, {
      getFirestore: firestoreWrapper,
    })

    beforeEach(() => {
      firestoreWrapper.mockClear()
    })

    it('should call firestoreWrapper for test', async () => {
      await collectionWithSpecifyFirestore.test.findById('TEST')
      expect(firestoreWrapper).toHaveBeenCalled()
    })

    it('should call firestoreWrapper for add to test', async () => {
      await collectionWithSpecifyFirestore.test.add({ name: 'TEST' })
      expect(firestoreWrapper).toHaveBeenCalled()
    })

    it('should call firestoreWrapper for test.sub', async () => {
      await collectionWithSpecifyFirestore.test('id').sub.find()
      expect(firestoreWrapper).toHaveBeenCalled()
    })

    it('should call firestoreWrapper for test.multi', async () => {
      await collectionWithSpecifyFirestore.test('id').multi.findById('TEST')
      expect(firestoreWrapper).toHaveBeenCalled()
    })
  })
})
