import { collection, getFirestore } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreCollection, firestoreZodCollection } from '../firestore-collection'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreCollection', () => {
  it('should invoke collection(getFirestore(), name)', () => {
    firestoreCollection('foo')
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo')
  })

  it('should invoke collection(getFirestore(), name) for subCollection', () => {
    firestoreCollection(['foo', 'id', 'bar'])
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo/id/bar')
  })
})

describe('firestoreZodCollection', () => {
  it('should invoke collection(getFirestore(), name)', () => {
    firestoreZodCollection('foo', TestDocumentZod)
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo')
  })

  it('should invoke collection(getFirestore(), name) for subCollection', () => {
    firestoreZodCollection(['foo', 'id', 'bar'], TestDocumentZod)
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo/id/bar')
  })
})
