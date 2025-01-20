import { type CollectionReference, type DocumentReference, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  firestoreCollection,
  firestoreDocument,
  firestoreZodDataConverter,
  type ZodCollectionReference,
  type ZodDocumentReference,
  type ZodDocumentSnapshot,
  type ZodQuerySnapshot,
} from '../../../base'
import { schemaFirestoreFactoryBuilder } from '../../../schema/schema-firestore-factory-builder'
import { multiDocumentCollectionFactory } from '../multi-document-collection-factory'

jest.mock('../../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

type TestDocumentReference = ZodDocumentReference<typeof TestDocumentZod>
type TestCollectionReference = ZodCollectionReference<typeof TestDocumentZod>
type TestDocumentSnapshot = ZodDocumentSnapshot<typeof TestDocumentZod>
type TestQuerySnapshot = ZodQuerySnapshot<typeof TestDocumentZod>

describe('multiDocumentCollectionFactory', () => {
  const collection = multiDocumentCollectionFactory(
    schemaFirestoreFactoryBuilder('foo', { zod: TestDocumentZod }, { getFirestore }).build(),
  )

  describe('findById', () => {
    it('should return undefined if document doest not exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      documentRef.withConverter.mockReturnThis()
      const snapshot = mock<TestDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findById('id', { _id: false })).resolves.toBeUndefined()
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

      await expect(collection.findById('id', { _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
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

      await expect(collection.findByIdOrThrow('id', { _id: false })).rejects.toThrow()
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

      await expect(collection.findByIdOrThrow('id', { _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('query', () => {
    it('should invoke firestoreZodCollection', async () => {
      const collectionRef = mock<TestCollectionReference>()
      collectionRef.withConverter.mockReturnThis()
      const snapshot = mock<TestQuerySnapshot>({ empty: true })
      collectionRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreCollection).mockReturnValue(collectionRef)

      await collection.query({ name: 'test' }, { _id: false })

      expect(firestoreCollection).toHaveBeenCalledWith(['foo'], getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('add', () => {
    it('should invoke add on firestoreCollection', async () => {
      const collectionRef = mock<CollectionReference>()
      collectionRef.withConverter.mockReturnThis()
      jest.mocked(firestoreCollection).mockReturnValue(collectionRef)

      await collection.add({ name: 'test' })

      expect(collectionRef.add).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('create', () => {
    it('should invoke create on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.create('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.create).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' })
    })

    it('should invoke update on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update('bar', { name: 'test' }, { exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' }, { exists: true })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete('bar')

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith(undefined)
    })

    it('should invoke delete on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete('bar', { exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith({ exists: true })
    })
  })
})
