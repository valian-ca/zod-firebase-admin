import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { z } from 'zod'

import { collectionFactory } from '../collection-factory'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionFactory', () => {
  it('should invoke multiDocumentCollectionFactory when no singleDocumentKey is provided', async () => {
    const collection = collectionFactory('foo', { zod: TestDocumentZod })

    await setDoc(collection.write.doc('id'), { name: 'bar' })

    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
  })

  it('should invoke singleDocumentCollectionFactory when a singleDocumentKey is provided', async () => {
    const collection = collectionFactory('foo', { zod: TestDocumentZod, singleDocumentKey: 'KEY' })

    const documentReference = collection.read.doc()
    await getDoc(documentReference)

    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/KEY')
  })
})
