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
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
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

vi.mock('@firebase/firestore')
vi.mock('../../../base')

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
    { zod: TestDocumentZod },
  )

  describe('findById', () => {
    it('should return undefined if document doest not exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findById('id')).resolves.toBeUndefined()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        name: 'foo',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

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
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdOrThrow('id')).rejects.toThrow()
    })

    it('should return value if document exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        name: 'foo',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdOrThrow('id', { _id: false })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('findByIdWithFallback', () => {
    it('should return existing document if it exists', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(true)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      const parsedDocumentValue = {
        _id: 'id',
        name: 'bar',
      }
      snapshot.data.mockReturnValue(parsedDocumentValue)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdWithFallback('id', { name: 'fallback' })).resolves.toEqual(parsedDocumentValue)

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
    })

    it('should return fallback with injected _id when document does not exist (default schema)', async () => {
      const documentRef = mock<TestDocumentReference>()
      const snapshot = mock<TestDocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef)

      await expect(collection.findByIdWithFallback('id', { name: 'fallback' })).resolves.toEqual({
        _id: 'id',
        name: 'fallback',
      })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
    })

    it('should parse fallback with _id via zod when includeDocumentIdForZod is true', async () => {
      const TestDocumentZodWithId = z.discriminatedUnion('_id', [
        z.object({ _id: z.literal('string'), value: z.string() }),
        z.object({ _id: z.literal('number'), value: z.number() }),
      ])
      type TestDocumentReferenceWithId = ZodDocumentReference<typeof TestDocumentZodWithId>
      type TestDocumentSnapshotWithId = ZodDocumentSnapshot<typeof TestDocumentZodWithId>

      const schema = { zod: TestDocumentZodWithId, includeDocumentIdForZod: true } as const
      const collectionWithId = multiDocumentCollectionFactory(
        schemaFirestoreFactoryBuilder('foo', schema, { getFirestore }).build(),
        schema,
      )

      const documentRef = mock<TestDocumentReferenceWithId>()
      const snapshot = mock<TestDocumentSnapshotWithId>()
      snapshot.exists.mockReturnValue(false)
      vi.mocked(getDoc).mockResolvedValue(snapshot)
      vi.mocked(firestoreDocument).mockReturnValue(documentRef as unknown as TestDocumentReference)

      await expect(collectionWithId.findByIdWithFallback('string', { value: 'fallback' })).resolves.toEqual({
        _id: 'string',
        value: 'fallback',
      })
      await expect(collectionWithId.findByIdWithFallback('number', { value: 42 })).resolves.toEqual({
        _id: 'number',
        value: 42,
      })

      expect(firestoreDocument).toHaveBeenNthCalledWith(1, ['foo'], 'string', getFirestore())
      expect(firestoreDocument).toHaveBeenNthCalledWith(2, ['foo'], 'number', getFirestore())
    })
  })

  describe('query', () => {
    it('should invoke firestoreZodCollection', async () => {
      const collectionRef = mock<TestCollectionReference>()
      const snapshot = mock<TestQuerySnapshot>({ empty: true })
      vi.mocked(getDocs).mockResolvedValue(snapshot)
      vi.mocked(firestoreCollection).mockReturnValue(collectionRef)

      await collection.query({ name: 'test' }, { _id: false })

      expect(firestoreCollection).toHaveBeenCalledWith(['foo'], getFirestore())
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: false }, {})
    })
  })

  describe('add', () => {
    it('should invoke add on firestoreCollection', async () => {
      const collectionRef = mock<CollectionReference>()
      collectionRef.withConverter.mockReturnThis()
      vi.mocked(firestoreCollection).mockReturnValue(collectionRef)

      await collection.add({ name: 'test' })

      expect(addDoc).toHaveBeenCalledWith(collectionRef, { name: 'test' })
    })
  })

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      vi.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' }, { merge: true })
    })

    it('should invoke set on firestoreDocument without options', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      vi.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      vi.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update('bar', { name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(updateDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      docRef.withConverter.mockReturnThis()
      vi.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete('bar')

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
      expect(deleteDoc).toHaveBeenCalledWith(docRef)
    })
  })
})
