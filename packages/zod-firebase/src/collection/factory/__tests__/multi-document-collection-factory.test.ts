import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentReference,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from '@firebase/firestore'
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
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)
      jest.mocked(getDoc).mockResolvedValue(snapshot)
      jest.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findById('id')).resolves.toBeUndefined()
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

      await expect(collection.findById('id', { _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
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

      await expect(collection.findByIdOrThrow('id')).rejects.toThrow()
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

      await expect(collection.findByIdOrThrow('id', { _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('query', () => {
    it('should invoke firestoreZodCollection', async () => {
      const collectionRef = mock<TestCollectionReference>()
      const snapshot = mock<TestQuerySnapshot>({ empty: true })
      jest.mocked(getDocs).mockResolvedValue(snapshot)
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

      expect(addDoc).toHaveBeenCalledWith(collectionRef, { name: 'test' })
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(updateDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete('bar')

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(deleteDoc).toHaveBeenCalledWith(docRef)
    })
  })
})
