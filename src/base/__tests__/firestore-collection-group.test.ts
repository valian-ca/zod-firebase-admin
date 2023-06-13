import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'
import { firestoreCollectionGroup, firestoreZodCollectionGroup } from '../firestore-collection-group'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroup('foo')
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})

describe('firestoreZodCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreZodCollectionGroup('foo', TestDocumentZod)
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})
