import { type DocumentReference, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  firestoreCollection,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
  type ZodDocumentReference,
  type ZodDocumentSnapshot,
} from '../../base'
import { singleDocumentCollectionFactory } from '../single-document-collection-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('singleDocumentCollectionFactory', () => {
  const collection = singleDocumentCollectionFactory('foo', TestDocumentZod, 'KEY', { getFirestore })
  const firestoreZodOptions = { firestore: getFirestore() }

  describe('read', () => {
    it('should invoke firestoreZodCollection', () => {
      collection.read.collection()

      expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, firestoreZodOptions)
    })

    it('should invoke firestoreZodDocument', () => {
      collection.read.doc()

      expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'KEY', TestDocumentZod, firestoreZodOptions)
    })

    it('should invoke firestoreZodCollectionGroup', () => {
      collection.read.collectionGroup()

      expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, firestoreZodOptions)
    })
  })

  describe('write', () => {
    it('should invoke firestoreZodCollection', () => {
      collection.write.collection()

      expect(firestoreCollection).toHaveBeenCalledWith(['foo'], getFirestore())
    })

    it('should invoke firestoreZodDocument', () => {
      collection.write.doc()

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
    })
  })

  describe('find', () => {
    it('should return undefined if document doest not exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.find()).resolves.toBeUndefined()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        _createTime: Timestamp.now(),
        _updateTime: Timestamp.now(),
        _readTime: Timestamp.now(),
        name: 'bar',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.find()).resolves.toEqual(parsedDocumentValue)
    })
  })

  describe('findByIdOrThrow', () => {
    it('should throw if document doest not exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow()).rejects.toThrow()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        _createTime: Timestamp.now(),
        _updateTime: Timestamp.now(),
        _readTime: Timestamp.now(),
        name: 'bar',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow()).resolves.toEqual(parsedDocumentValue)
    })
  })

  describe('create', () => {
    it('should invoke create on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.create({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.create).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.set).toHaveBeenCalledWith({ name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' })
    })

    it('should invoke update on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' }, { exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' }, { exists: true })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete()

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith(undefined)
    })

    it('should invoke delete on firestoreDocument with precondition', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete({ exists: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.delete).toHaveBeenCalledWith({ exists: true })
    })
  })
})
