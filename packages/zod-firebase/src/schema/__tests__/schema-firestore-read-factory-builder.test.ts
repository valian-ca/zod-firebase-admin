import {
  type CollectionReference,
  type DocumentReference,
  type FirestoreDataConverter,
  getFirestore,
  type Query,
} from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  type DocumentOutput,
  firestoreCollection,
  firestoreCollectionGroup,
  firestoreDocument,
  firestoreZodDataConverter,
} from '../../base'
import { schemaFirestoreReadFactoryBuilder } from '../schema-firestore-read-factory-builder'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

const mockedDataConverter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()
jest.mocked(firestoreZodDataConverter).mockReturnValue(mockedDataConverter)

const collectionRef = mock<CollectionReference>()
collectionRef.withConverter.mockReturnThis()
jest.mocked(firestoreCollection).mockReturnValue(collectionRef)

const collectionGroupRef = mock<Query>()
collectionGroupRef.withConverter.mockReturnThis()
jest.mocked(firestoreCollectionGroup).mockReturnValue(collectionGroupRef)

const documentRef = mock<DocumentReference>()
documentRef.withConverter.mockReturnThis()
jest.mocked(firestoreDocument).mockReturnValue(documentRef)

describe('schemaFirestoreReadFactoryBuilder', () => {
  describe('builder', () => {
    it('should build default converter', () => {
      schemaFirestoreReadFactoryBuilder('foo', { zod: TestDocumentZod })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {})
    })

    it('should build default converter with includeDocumentIdForZod', () => {
      schemaFirestoreReadFactoryBuilder('foo', {
        zod: TestDocumentZod,
        includeDocumentIdForZod: true,
      })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        includeDocumentIdForZod: true,
      })
    })

    it('should build default converter with zodErrorHandler', () => {
      const zodErrorHandler = jest.fn()
      schemaFirestoreReadFactoryBuilder('foo', { zod: TestDocumentZod }, { zodErrorHandler })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        zodErrorHandler,
      })
    })

    it('should build default converter with snapshotDataConverter', () => {
      const snapshotDataConverter = jest.fn()
      schemaFirestoreReadFactoryBuilder('foo', { zod: TestDocumentZod }, { snapshotDataConverter })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        snapshotDataConverter,
      })
    })
  })

  describe('with specified getFirestore option', () => {
    const read = schemaFirestoreReadFactoryBuilder('foo', { zod: TestDocumentZod }, { getFirestore }).build()

    describe('without option', () => {
      it('should invoke firestoreCollection', () => {
        expect(read.collection()).toBe(collectionRef)

        expect(firestoreCollection).toHaveBeenCalledWith(['foo'], getFirestore())
        expect(collectionRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })

      it('should invoke firestoreDocument', () => {
        expect(read.doc('id')).toBe(documentRef)

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
        expect(documentRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        expect(read.collectionGroup()).toBe(collectionGroupRef)

        expect(firestoreCollectionGroup).toHaveBeenCalledWith('foo', getFirestore())
        expect(collectionGroupRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })
    })

    describe('with option', () => {
      it('should invoke firestoreCollection', () => {
        expect(read.collection({ _id: false })).toBe(collectionRef)

        expect(firestoreCollection).toHaveBeenCalledWith(['foo'], getFirestore())
        expect(collectionRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
        expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
      })

      it('should invoke firestoreDocument', () => {
        expect(read.doc('id', { _id: false })).toBe(documentRef)

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
        expect(documentRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
        expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        expect(read.collectionGroup({ _id: false })).toBe(collectionGroupRef)

        expect(firestoreCollectionGroup).toHaveBeenCalledWith('foo', getFirestore())
        expect(collectionGroupRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
        expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
      })
    })
  })

  describe('without specified getFirestore', () => {
    const read = schemaFirestoreReadFactoryBuilder('foo', { zod: TestDocumentZod }).build()

    describe('without option', () => {
      it('should invoke firestoreCollection', () => {
        expect(read.collection()).toBe(collectionRef)

        expect(firestoreCollection).toHaveBeenCalledWith(['foo'], undefined)
        expect(collectionRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })

      it('should invoke firestoreDocument', () => {
        expect(read.doc('id')).toBe(documentRef)

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', undefined)
        expect(documentRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        expect(read.collectionGroup()).toBe(collectionGroupRef)

        expect(firestoreCollectionGroup).toHaveBeenCalledWith('foo', undefined)
        expect(collectionGroupRef.withConverter).toHaveBeenCalledWith(mockedDataConverter)
      })
    })
  })
})
