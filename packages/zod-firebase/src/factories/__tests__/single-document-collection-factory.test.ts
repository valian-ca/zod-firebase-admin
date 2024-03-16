import {
  type CollectionReference,
  deleteDoc,
  type DocumentReference,
  getDoc,
  getFirestore,
  setDoc,
  type SnapshotMetadata,
  updateDoc,
} from 'firebase/firestore'
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

const META_DATA_MOCK = mock<SnapshotMetadata>()

type TestDocumentReference = ZodDocumentReference<typeof TestDocumentZod>
type TestDocumentSnapshot = ZodDocumentSnapshot<typeof TestDocumentZod>

describe('singleDocumentCollectionFactory', () => {
  const collection = singleDocumentCollectionFactory('foo', TestDocumentZod, 'KEY', { getFirestore })
  const firestoreZodOptions = { firestore: getFirestore() }

  beforeEach(() => {
    const collectionRef = mock<CollectionReference>()
    collectionRef.withConverter.mockReturnThis()
    jest.mocked(firestoreCollection).mockReturnValue(collectionRef)
    const documentRef = mock<DocumentReference>()
    documentRef.withConverter.mockReturnThis()
    jest.mocked(firestoreDocument).mockReturnValue(documentRef)
  })

  describe('without meta options', () => {
    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, firestoreZodOptions)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc()

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'KEY',
          TestDocumentZod,
          undefined,
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, undefined, firestoreZodOptions)
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
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.find()).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findOrThrow()).resolves.toEqual(parsedDocumentValue)
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

  describe('with meta options', () => {
    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _metadata: true })

        expect(firestoreZodCollection).toHaveBeenCalledWith(
          ['foo'],
          TestDocumentZod,
          { _metadata: true },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc({ _metadata: true })

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'KEY',
          TestDocumentZod,
          { _metadata: true },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _metadata: true })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
          'foo',
          TestDocumentZod,
          { _metadata: true },
          firestoreZodOptions,
        )
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
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.find({ _metadata: true })).resolves.toBeUndefined()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(true)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        const parsedDocumentValue = {
          _id: 'id',
          _metadata: META_DATA_MOCK,
          name: 'foo',
        }
        snapshot.data.mockReturnValue(parsedDocumentValue)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.find({ _metadata: true })).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findOrThrow({ _metadata: true })).rejects.toThrow()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(true)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        const parsedDocumentValue = {
          _id: 'id',
          _metadata: META_DATA_MOCK,
          name: 'foo',
        }
        snapshot.data.mockReturnValue(parsedDocumentValue)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findOrThrow({ _metadata: true })).resolves.toEqual(parsedDocumentValue)
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
})
