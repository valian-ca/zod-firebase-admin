import { type FirestoreDataConverter, getFirestore } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { firestoreDocument, firestoreDocumentWithConverter, firestoreZodDocument } from '../firestore-document'
import { type DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

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

describe('firestoreDocumentWithConverter', () => {
  it('should invoke getFirestore().doc', () => {
    firestoreDocumentWithConverter('foo', 'id', converter)
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
    expect(getFirestore().doc('foo/id').withConverter).toHaveBeenCalledWith(converter)
  })

  it('should invoke getFirestore().doc for subCollection', () => {
    firestoreDocumentWithConverter(['foo', 'parent', 'bar'], 'id', converter)
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/parent/bar/id')
    expect(getFirestore().doc('foo/id').withConverter).toHaveBeenCalledWith(converter)
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
