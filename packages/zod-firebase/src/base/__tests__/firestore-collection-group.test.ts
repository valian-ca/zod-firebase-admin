import { collectionGroup, FirestoreDataConverter, getFirestore } from 'firebase/firestore'
import { z } from 'zod'

import {
  firestoreCollectionGroup,
  firestoreCollectionGroupWithConverter,
  firestoreZodCollectionGroup,
} from '../firestore-collection-group'
import { mock } from 'jest-mock-extended'
import { DocumentOutput } from '../types'

const TestDocumentZod = z.object({
  name: z.string(),
})

const converter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

describe('firestoreCollectionGroup', () => {
  it('should invoke collectionGroup(getFirestore(), name)', () => {
    firestoreCollectionGroup('foo')
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})

describe('firestoreCollectionGroupWithConverter', () => {
  it('should invoke collectionGroup(getFirestore(), name)', () => {
    firestoreCollectionGroupWithConverter('foo', converter)
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
    expect(collectionGroup(getFirestore(), 'foo').withConverter).toHaveBeenCalledWith(converter)
  })
})

describe('firestoreZodCollectionGroup', () => {
  it('should invoke collectionGroup(getFirestore(), name)', () => {
    firestoreZodCollectionGroup('foo', TestDocumentZod)
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})
