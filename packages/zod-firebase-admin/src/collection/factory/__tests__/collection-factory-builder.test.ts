import { getFirestore } from 'firebase-admin/firestore'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { collectionFactoryBuilder } from '../collection-factory-builder'

vi.mock('firebase-admin/firestore')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionFactoryBuilder', () => {
  it('should invoke multiDocumentCollectionFactory when no singleDocumentKey is provided', async () => {
    const collection = collectionFactoryBuilder('foo', { zod: TestDocumentZod }).build()

    await collection.write.doc('id').set({ name: 'bar' })

    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
    expect(getFirestore().doc('foo/id').set).toHaveBeenCalledWith({ name: 'bar' })
  })

  it('should invoke singleDocumentCollectionFactory when a singleDocumentKey is provided', async () => {
    const collection = collectionFactoryBuilder('foo', { zod: TestDocumentZod, singleDocumentKey: 'KEY' }).build()

    const documentReference = collection.read.doc()
    await documentReference.get()

    expect(getFirestore().doc).toHaveBeenCalledWith('foo/KEY')
    expect(getFirestore().doc('foo/KEY').get).toHaveBeenCalled()
  })
})
