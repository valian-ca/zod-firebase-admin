import { type FirestoreDataConverter, getFirestore } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { firestoreCollection, firestoreCollectionWithConverter, firestoreZodCollection } from '../firestore-collection'
import { type DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

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

describe('firestoreCollectionWithConverter', () => {
  it('should invoke getFirestore().collection', () => {
    firestoreCollectionWithConverter('foo', converter)
    expect(getFirestore().collection).toHaveBeenCalledWith('foo')
    expect(getFirestore().collection('foo').withConverter).toHaveBeenCalledWith(converter)
  })

  it('should invoke getFirestore().collection for subCollection', () => {
    firestoreCollectionWithConverter(['foo', 'id', 'bar'], converter)
    expect(getFirestore().collection).toHaveBeenCalledWith('foo/id/bar')
    expect(getFirestore().collection('foo/id/bar').withConverter).toHaveBeenCalledWith(converter)
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
