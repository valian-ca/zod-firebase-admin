import { FirestoreDataConverter, getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import {
  firestoreCollectionGroup,
  firestoreCollectionGroupWithConverter,
  firestoreZodCollectionGroup,
} from '../firestore-collection-group'
import { mock } from 'jest-mock-extended'
import type { DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

describe('firestoreCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroup('foo')
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})

describe('firestoreCollectionGroupWithConverter', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroupWithConverter('foo', converter)
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
    expect(getFirestore().collectionGroup('foo').withConverter).toHaveBeenCalledWith(converter)
  })
})

describe('firestoreZodCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreZodCollectionGroup('foo', TestDocumentZod)
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})
