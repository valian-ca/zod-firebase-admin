import { type DocumentReference, getFirestore } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import type { ZodDocumentReference, ZodDocumentSnapshot } from '../../base'
import {
  firestoreCollection,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
} from '../../base'
import { singleDocumentCollectionFactory } from '../single-document-collection-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('singleDocumentCollectionFactory', () => {
  const collection = singleDocumentCollectionFactory('foo', TestDocumentZod, 'KEY', { getFirestore })

  describe('read', () => {
    it('should invoke firestoreZodCollection', () => {
      collection.read.collection()

      expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, getFirestore())
    })

    it('should invoke firestoreZodDocument', () => {
      collection.read.doc()

      expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'KEY', TestDocumentZod, getFirestore())
    })

    it('should invoke firestoreZodCollectionGroup', () => {
      collection.read.collectionGroup()

      expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, getFirestore())
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
      snapshot.data.mockReturnValue({ _id: 'KEY', name: 'bar' })
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.find()).resolves.toEqual({ _id: 'KEY', name: 'bar' })
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
      snapshot.data.mockReturnValue({ _id: 'KEY', name: 'bar' })
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findOrThrow()).resolves.toEqual({ _id: 'KEY', name: 'bar' })
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
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(docRef.update).toHaveBeenCalledWith({ name: 'test' }, undefined)
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
