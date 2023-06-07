import { z } from 'zod'
import { any } from 'jest-mock-extended'
import { collectionsBuilder } from '../collection-builder'
import { collectionFactory } from '../factories'

jest.mock('../factories/collection-factory')

const TestDocumentZod = z.object({
  name: z.string(),
})

const TestSubCollectionDocumentZod = z.object({
  value: z.number(),
})

const schema = {
  test: { zod: TestDocumentZod, sub: { zod: TestSubCollectionDocumentZod, singleDocumentKey: 'KEY' } },
}

describe('collectionsBuilder', () => {
  it('should build collection from Schema', () => {
    const collection = collectionsBuilder(schema)

    expect(collectionFactory).toHaveBeenCalledWith('test', schema.test, any())

    collection.test('id')

    expect(collectionFactory).toHaveBeenCalledWith('sub', schema.test.sub, any(), ['test', 'id'])
  })
})
