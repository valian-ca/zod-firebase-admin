import { collection, type FirestoreDataConverter, getFirestore } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { firestoreCollection, firestoreCollectionWithConverter, firestoreZodCollection } from '../firestore-collection'
import { type DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

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

describe('firestoreCollectionWithConverter', () => {
  it('should invoke collection(getFirestore(), name)', () => {
    firestoreCollectionWithConverter('foo', converter)
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo')
    expect(collection(getFirestore(), 'foo').withConverter).toHaveBeenCalledWith(converter)
  })

  it('should invoke collection(getFirestore(), name) for subCollection', () => {
    firestoreCollectionWithConverter(['foo', 'id', 'bar'], converter)
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo/id/bar')
    expect(collection(getFirestore(), 'foo/id/bar').withConverter).toHaveBeenCalledWith(converter)
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
