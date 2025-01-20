import { doc, getDoc, getFirestore, setDoc } from '@firebase/firestore'
import { z } from 'zod'

import { collectionFactoryBuilder } from '../collection-factory-builder'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionFactoryBuilder', () => {
  it('should invoke multiDocumentCollectionFactory when no singleDocumentKey is provided', async () => {
    const collection = collectionFactoryBuilder('foo', { zod: TestDocumentZod }).build()

    await setDoc(collection.write.doc('id'), { name: 'bar' })

    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
  })

  it('should invoke singleDocumentCollectionFactory when a singleDocumentKey is provided', async () => {
    const collection = collectionFactoryBuilder('foo', { zod: TestDocumentZod, singleDocumentKey: 'KEY' }).build()

    const documentReference = collection.read.doc()
    await getDoc(documentReference)

    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/KEY')
  })
})
