import { type CollectionReference, type DocumentReference, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  firestoreCollection,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
  type ZodCollectionReference,
  type ZodDocumentReference,
  type ZodDocumentSnapshot,
  type ZodQuerySnapshot,
} from '../../base'
import { multiDocumentCollectionFactory } from '../multi-document-collection-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

type TestDocumentReference = ZodDocumentReference<typeof TestDocumentZod>
type TestCollectionReference = ZodCollectionReference<typeof TestDocumentZod>
type TestDocumentSnapshot = ZodDocumentSnapshot<typeof TestDocumentZod>
type TestQuerySnapshot = ZodQuerySnapshot<typeof TestDocumentZod>

describe('multiDocumentCollectionFactory', () => {
  describe('with specified getFirestore option', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod, { getFirestore })
    const firestoreZodOptions = { firestore: getFirestore() }

    beforeEach(() => {
      jest.mocked(firestoreCollection).mockReturnValue(mock<CollectionReference>())
      jest.mocked(firestoreDocument).mockReturnValue(mock<DocumentReference>())
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, firestoreZodOptions)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'id',
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
        collection.write.doc('id')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
      })
    })

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, { getFirestore }, ['root', 'parent'])

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection()

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
            'foo',
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
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
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id')).resolves.toBeUndefined()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id')).rejects.toThrow()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('query', () => {
      it('should invoke firestoreZodCollection', async () => {
        const collectionRef = mock<TestCollectionReference>()
        const snapshot = mock<TestQuerySnapshot>({ empty: true })
        collectionRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

        await collection.query({ name: 'test' })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, firestoreZodOptions)
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

  describe('without specified getFirestore', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod)

    beforeEach(() => {
      jest.mocked(firestoreCollection).mockReturnValue(mock<CollectionReference>())
      jest.mocked(firestoreDocument).mockReturnValue(mock<DocumentReference>())
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, {})
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, undefined, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, undefined, {})
      })
    })

    describe('write', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.write.collection()

        expect(firestoreCollection).toHaveBeenCalledWith(['foo'], undefined)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.write.doc('id')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', undefined)
      })
    })

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, {}, ['root', 'parent'])

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection()

          expect(firestoreZodCollection).toHaveBeenCalledWith(['root', 'parent', 'foo'], TestDocumentZod, undefined, {})
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            undefined,
            {},
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, undefined, {})
        })
      })

      describe('write', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.write.collection()

          expect(firestoreCollection).toHaveBeenCalledWith(['root', 'parent', 'foo'], undefined)
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.write.doc('id')

          expect(firestoreDocument).toHaveBeenCalledWith(['root', 'parent', 'foo'], 'id', undefined)
        })
      })
    })

    describe('findById', () => {
      it('should return undefined if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id')).resolves.toBeUndefined()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id')).rejects.toThrow()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('query', () => {
      it('should invoke firestoreZodCollection', async () => {
        const collectionRef = mock<TestCollectionReference>()
        const snapshot = mock<TestQuerySnapshot>({ empty: true })
        collectionRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

        await collection.query({ name: 'test' })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, {})
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

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.create).toHaveBeenCalledWith({ name: 'test' })
      })
    })

    describe('set', () => {
      it('should invoke set on firestoreDocument with options', async () => {
        const docRef = mock<DocumentReference>()
        docRef.withConverter.mockReturnThis()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.set('bar', { name: 'test' }, { merge: true })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.set).toHaveBeenCalledWith({ name: 'test' }, { merge: true })
      })
    })

    describe('update', () => {
      it('should invoke update on firestoreDocument', async () => {
        const docRef = mock<DocumentReference>()
        docRef.withConverter.mockReturnThis()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.update('bar', { name: 'test' })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.update).toHaveBeenCalledWith({ name: 'test' })
      })

      it('should invoke update on firestoreDocument with precondition', async () => {
        const docRef = mock<DocumentReference>()
        docRef.withConverter.mockReturnThis()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.update('bar', { name: 'test' }, { exists: true })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.update).toHaveBeenCalledWith({ name: 'test' }, { exists: true })
      })
    })

    describe('delete', () => {
      it('should invoke delete on firestoreDocument', async () => {
        const docRef = mock<DocumentReference>()
        docRef.withConverter.mockReturnThis()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.delete('bar')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.delete).toHaveBeenCalledWith(undefined)
      })

      it('should invoke delete on firestoreDocument with precondition', async () => {
        const docRef = mock<DocumentReference>()
        docRef.withConverter.mockReturnThis()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.delete('bar', { exists: true })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', undefined)
        expect(docRef.delete).toHaveBeenCalledWith({ exists: true })
      })
    })
  })

  describe('with specified meta options', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod)

    beforeEach(() => {
      jest.mocked(firestoreCollection).mockReturnValue(mock<CollectionReference>())
      jest.mocked(firestoreDocument).mockReturnValue(mock<DocumentReference>())
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _updateTime: true })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, { _updateTime: true }, {})
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id', { _updateTime: true })

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, { _updateTime: true }, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _updateTime: true })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _updateTime: true }, {})
      })
    })

    describe('write', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.write.collection()

        expect(firestoreCollection).toHaveBeenCalledWith(['foo'], undefined)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.write.doc('id')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', undefined)
      })
    })

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, {}, ['root', 'parent'])

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection({ _updateTime: true })

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            { _updateTime: true },
            {},
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id', { _updateTime: true })

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            { _updateTime: true },
            {},
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup({ _updateTime: true })

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _updateTime: true }, {})
        })
      })
    })

    describe('findById', () => {
      it('should return undefined if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id', { _updateTime: true })).resolves.toBeUndefined()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id', { _updateTime: true })).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>({ exists: false })
        documentRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id', { _updateTime: true })).rejects.toThrow()
      })

      it('should return value if document exists', async () => {
        const documentRef = mock<TestDocumentReference>()
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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id', { _updateTime: true })).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('query', () => {
      it('should invoke firestoreZodCollection', async () => {
        const collectionRef = mock<TestCollectionReference>()
        const snapshot = mock<TestQuerySnapshot>({ empty: true })
        collectionRef.get.mockResolvedValue(snapshot)
        jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

        await collection.query({ name: 'test' }, { _updateTime: true })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, { _updateTime: true }, {})
      })
    })
  })

  describe('with specified includeDocumentIdForZod and zodErrorHandler', () => {
    const zodErrorHandler = jest.fn()
    const firestoreZodOptions = {
      includeDocumentIdForZod: true,
      zodErrorHandler,
    }
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod, firestoreZodOptions)

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, undefined, firestoreZodOptions)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'id',
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

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, firestoreZodOptions, [
        'root',
        'parent',
      ])

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection()

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
            'foo',
            TestDocumentZod,
            undefined,
            firestoreZodOptions,
          )
        })
      })
    })
  })
})
