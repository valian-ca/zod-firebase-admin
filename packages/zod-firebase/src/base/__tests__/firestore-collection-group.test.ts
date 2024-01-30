import { collectionGroup, getFirestore } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreCollectionGroup, firestoreZodCollectionGroup } from '../firestore-collection-group'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroup('foo')
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})

describe('firestoreZodCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreZodCollectionGroup('foo', TestDocumentZod)
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})
