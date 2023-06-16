import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'
import { mock } from 'jest-mock-extended'
import { multiDocumentCollectionFactory } from '../multi-document-collection-factory'
import type { ZodCollectionReference, ZodDocumentReference, ZodDocumentSnapshot, ZodQuerySnapshot } from '../../base'
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

describe('multiDocumentCollectionFactory', () => {
  const collection = multiDocumentCollectionFactory('foo', TestDocumentZod, { getFirestore })

  describe('read', () => {
    it('should invoke firestoreZodCollection', () => {
      collection.read.collection()

      expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, getFirestore())
    })

    it('should invoke firestoreZodDocument', () => {
      collection.read.doc('id')

      expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, getFirestore())
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
      collection.write.doc('id')

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
    })
  })

  describe('for sub-collection', () => {
    const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, { getFirestore }, ['root', 'parent'])

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        subCollection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['root', 'parent', 'foo'], TestDocumentZod, getFirestore())
      })

      it('should invoke firestoreZodDocument', () => {
        subCollection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['root', 'parent', 'foo'],
          'id',
          TestDocumentZod,
          getFirestore()
        )
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        subCollection.read.collectionGroup()

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, getFirestore())
      })
    })

    describe('write', () => {
      it('should invoke firestoreZodCollection', () => {
        subCollection.write.collection()

        expect(firestoreCollection).toHaveBeenCalledWith(['root', 'parent', 'foo'], getFirestore())
      })

      it('should invoke firestoreZodDocument', () => {
        subCollection.write.doc('id')

        expect(firestoreDocument).toHaveBeenCalledWith(['root', 'parent', 'foo'], 'id', getFirestore())
      })
    })
  })

  describe('findById', () => {
    it('should return undefined if document doest not exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findById('id')).resolves.toBeUndefined()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      snapshot.data.mockReturnValue({ _id: 'id', name: 'bar' })
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findById('id')).resolves.toEqual({ _id: 'id', name: 'bar' })
    })
  })

  describe('findByIdOrThrow', () => {
    it('should throw if document doest not exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: false })
      documentRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdOrThrow('id')).rejects.toThrow()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<ZodDocumentReference>()
      const snapshot = mock<ZodDocumentSnapshot>({ exists: true })
      documentRef.get.mockResolvedValue(snapshot)
      snapshot.data.mockReturnValue({ _id: 'id', name: 'bar' })
      jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdOrThrow('id')).resolves.toEqual({ _id: 'id', name: 'bar' })
    })
  })

  describe('query', () => {
    it('should invoke firestoreZodCollection', async () => {
      const collectionRef = mock<ZodCollectionReference>()
      const snapshot = mock<ZodQuerySnapshot>({ empty: true })
      collectionRef.get.mockResolvedValue(snapshot)
      jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

      await collection.query({ name: 'test' })

      expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, getFirestore())
    })
  })
})
