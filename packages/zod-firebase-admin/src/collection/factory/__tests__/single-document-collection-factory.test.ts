import { type DocumentReference, getFirestore, Timestamp } from 'firebase-admin/firestore'
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
      documentRef.withConverter.mockReturnThis()
      const snapshot = mock<TestDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.find()).resolves.toBeUndefined()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      documentRef.withConverter.mockReturnThis()
      const snapshot = mock<TestDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        _createTime: Timestamp.now(),
        _updateTime: Timestamp.now(),
        _readTime: Timestamp.now(),
        name: 'bar',
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
      documentRef.withConverter.mockReturnThis()
      const snapshot = mock<TestDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow()).rejects.toThrow()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      documentRef.withConverter.mockReturnThis()

      const snapshot = mock<TestDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        _createTime: Timestamp.now(),
        _updateTime: Timestamp.now(),
        _readTime: Timestamp.now(),
        name: 'bar',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow({ _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('create', () => {
    it('should invoke create on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.create({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.create).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' })
    })

    it('should invoke update on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' }, { exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' }, { exists: true })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete()

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith(undefined)
    })

    it('should invoke delete on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete({ exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith({ exists: true })
    })
  })
})
