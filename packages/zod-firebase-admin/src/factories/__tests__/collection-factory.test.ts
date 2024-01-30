import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import { collectionFactory } from '../collection-factory'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionFactory', () => {
  it('should invoke multiDocumentCollectionFactory when no singleDocumentKey is provided', async () => {
    const collection = collectionFactory('foo', { zod: TestDocumentZod }, { getFirestore })

    await collection.write.doc('id').set({ name: 'bar' })

    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
    expect(getFirestore().doc('foo/id').set).toHaveBeenCalledWith({ name: 'bar' })
  })

  it('should invoke singleDocumentCollectionFactory when a singleDocumentKey is provided', async () => {
    const collection = collectionFactory('foo', { zod: TestDocumentZod, singleDocumentKey: 'KEY' }, { getFirestore })

    const documentReference = collection.read.doc()
    await documentReference.get()

    expect(getFirestore().doc).toHaveBeenCalledWith('foo/KEY')
    expect(getFirestore().doc('foo/KEY').get).toHaveBeenCalled()
  })
})
