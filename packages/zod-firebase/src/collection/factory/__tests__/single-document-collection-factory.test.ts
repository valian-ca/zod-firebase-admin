import { deleteDoc, type DocumentReference, getDoc, getFirestore, setDoc, updateDoc } from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  firestoreDocument,
  firestoreZodDataConverter,
  type ZodDocumentReference,
  type ZodDocumentSnapshot,
} from '../../../base'
import { schemaFirestoreFactoryBuilder } from '../../../schema/schema-firestore-factory-builder'
import { singleDocumentCollectionFactory } from '../single-document-collection-factory'

jest.mock('../../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

type TestDocumentReference = ZodDocumentReference<typeof TestDocumentZod>
type TestDocumentSnapshot = ZodDocumentSnapshot<typeof TestDocumentZod>

describe('singleDocumentCollectionFactory', () => {
  const collection = singleDocumentCollectionFactory(
    schemaFirestoreFactoryBuilder('foo', { zod: TestDocumentZod }, { getFirestore }).build(),
    'KEY',
  )

  describe('read', () => {
    it('should return the documentRef', () => {
      const documentRef = mock<TestDocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      collection.read.doc({ _id: false })
      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('write', () => {
    it('should return the documentRef', () => {
      const documentRef = mock<TestDocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      collection.write.doc()
      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
    })
  })

  describe('find', () => {
    it('should return undefined if document doest not exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)
      jest.mocked(getDoc).mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.find()).resolves.toBeUndefined()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      jest.mocked(getDoc).mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        name: 'foo',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.find({ _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('findByIdOrThrow', () => {
    it('should throw if document doest not exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)
      jest.mocked(getDoc).mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow()).rejects.toThrow()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      jest.mocked(getDoc).mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        name: 'foo',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow({ _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(updateDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete()

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(deleteDoc).toHaveBeenCalledWith(docRef)
    })
  })
})
