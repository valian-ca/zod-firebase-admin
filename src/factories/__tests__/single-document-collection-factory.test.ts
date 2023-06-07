import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'
import { mock } from 'jest-mock-extended'
import { singleDocumentCollectionFactory } from '../single-document-collection-factory'
import type { ZodDocumentReference, ZodDocumentSnapshot } from '../../base'
import {
  firestoreCollection,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
} from '../../base'

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
})
