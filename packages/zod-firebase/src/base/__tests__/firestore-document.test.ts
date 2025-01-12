import { doc, FirestoreDataConverter, getFirestore } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreDocument, firestoreDocumentWithConverter, firestoreZodDocument } from '../firestore-document'
import { mock } from 'jest-mock-extended'
import { DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

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

describe('firestoreDocumentWithConverter', () => {
  it('should invoke doc(getFirestore(), id)', () => {
    firestoreDocumentWithConverter('foo', 'id', converter)
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
    expect(doc(getFirestore(), 'foo/id').withConverter).toHaveBeenCalledWith(converter)
  })

  it('should invoke doc(getFirestore(), id) for subCollection', () => {
    firestoreDocumentWithConverter(['foo', 'parent', 'bar'], 'id', converter)
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/parent/bar/id')
    expect(doc(getFirestore(), 'foo/id').withConverter).toHaveBeenCalledWith(converter)
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
