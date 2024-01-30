import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import { firestoreCollection, firestoreZodCollection } from '../firestore-collection'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreCollection', () => {
  it('should invoke getFirestore().collection', () => {
    firestoreCollection('foo')
    expect(getFirestore().collection).toHaveBeenCalledWith('foo')
  })

  it('should invoke getFirestore().collection for subCollection', () => {
    firestoreCollection(['foo', 'id', 'bar'])
    expect(getFirestore().collection).toHaveBeenCalledWith('foo/id/bar')
  })
})

describe('firestoreZodCollection', () => {
  it('should invoke getFirestore().collection', () => {
    firestoreZodCollection('foo', TestDocumentZod)
    expect(getFirestore().collection).toHaveBeenCalledWith('foo')
  })

  it('should invoke getFirestore().collection for subCollection', () => {
    firestoreZodCollection(['foo', 'id', 'bar'], TestDocumentZod)
    expect(getFirestore().collection).toHaveBeenCalledWith('foo/id/bar')
  })
})
