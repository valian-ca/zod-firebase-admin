import { doc, getFirestore } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreDocument, firestoreZodDocument } from '../firestore-document'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreDocument', () => {
  it('should invoke doc(getFirestore(), id)', () => {
    firestoreDocument('foo', 'id')
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
  })

  it('should invoke doc(getFirestore(), id) for subCollection', () => {
    firestoreDocument(['foo', 'parent', 'bar'], 'id')
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/parent/bar/id')
  })
})

describe('firestoreZodDocument', () => {
  it('should invoke doc(getFirestore(), id)', () => {
    firestoreZodDocument('foo', 'id', TestDocumentZod)
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
  })

  it('should invoke doc(getFirestore(), id) for subCollection', () => {
    firestoreZodDocument(['foo', 'parent', 'bar'], 'id', TestDocumentZod)
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/parent/bar/id')
  })
})
