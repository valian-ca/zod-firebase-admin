import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import { firestoreDocument, firestoreZodDocument } from '../firestore-document'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreDocument', () => {
  it('should invoke getFirestore().doc', () => {
    firestoreDocument('foo', 'id')
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
  })

  it('should invoke getFirestore().doc for subCollection', () => {
    firestoreDocument(['foo', 'parent', 'bar'], 'id')
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/parent/bar/id')
  })
})

describe('firestoreZodDocument', () => {
  it('should invoke getFirestore().doc', () => {
    firestoreZodDocument('foo', 'id', TestDocumentZod)
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
  })

  it('should invoke getFirestore().doc for subCollection', () => {
    firestoreZodDocument(['foo', 'parent', 'bar'], 'id', TestDocumentZod)
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/parent/bar/id')
  })
})
