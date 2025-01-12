import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentReference,
  type FirestoreDataConverter,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import {
  type DocumentOutput,
  firestoreCollection,
  firestoreCollectionGroupWithConverter,
  firestoreCollectionWithConverter,
  firestoreDocument,
  firestoreDocumentWithConverter,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDataConverter,
  firestoreZodDocument,
  type ZodCollectionReference,
  type ZodDocumentReference,
  type ZodDocumentSnapshot,
  type ZodQuerySnapshot,
} from '../../base'
import {
  type MultiDocumentCollectionFactory,
  multiDocumentCollectionFactory,
} from '../multi-document-collection-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

type TestDocumentReference = ZodDocumentReference<typeof TestDocumentZod>
type TestCollectionReference = ZodCollectionReference<typeof TestDocumentZod>
type TestDocumentSnapshot = ZodDocumentSnapshot<typeof TestDocumentZod>
type TestQuerySnapshot = ZodQuerySnapshot<typeof TestDocumentZod>

const MockDataConverter = mock<FirestoreDataConverter<DocumentOutput<typeof TestDocumentZod>>>()

describe('multiDocumentCollectionFactory', () => {
  beforeEach(() => {
    const collectionRef = mock<CollectionReference>()
    collectionRef.withConverter.mockReturnThis()
    jest.mocked(firestoreCollection).mockReturnValue(collectionRef)
    const documentRef = mock<DocumentReference>()
    documentRef.withConverter.mockReturnThis()
    jest.mocked(firestoreDocument).mockReturnValue(documentRef)
    jest.mocked(firestoreZodDataConverter).mockReturnValue(MockDataConverter)
  })

  describe('with specified getFirestore option', () => {
    let collection: MultiDocumentCollectionFactory<{ zod: typeof TestDocumentZod }>
    const firestoreZodOptions = { firestore: getFirestore() }
    beforeEach(() => {
      collection = multiDocumentCollectionFactory('foo', TestDocumentZod, undefined, { getFirestore })
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreCollectionWithConverter).toHaveBeenCalledWith(['foo'], MockDataConverter, getFirestore())
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreDocumentWithConverter).toHaveBeenCalledWith(['foo'], 'id', MockDataConverter, getFirestore())
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreCollectionGroupWithConverter).toHaveBeenCalledWith('foo', MockDataConverter, getFirestore())
      })
    })

    describe('read with options', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _id: false })

        expect(firestoreZodCollection).toHaveBeenCalledWith(
          ['foo'],
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id', { _id: false })

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'id',
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _id: false })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
          'foo',
          TestDocumentZod,
          { _id: false },
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
        collection.write.doc('id')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'id', getFirestore())
      })
    })

    describe('for sub-collection', () => {
      let subCollection: MultiDocumentCollectionFactory<{ zod: typeof TestDocumentZod }>

      beforeEach(() => {
        subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, ['root', 'parent'], { getFirestore })
      })

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection()

          expect(firestoreCollectionWithConverter).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            MockDataConverter,
            getFirestore(),
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreDocumentWithConverter).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            MockDataConverter,
            getFirestore(),
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreCollectionGroupWithConverter).toHaveBeenCalledWith('foo', MockDataConverter, getFirestore())
        })
      })

      describe('read with options', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection({ _id: false })

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            { _id: false },
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id', { _id: false })

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            { _id: false },
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup({ _id: false })

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
            'foo',
            TestDocumentZod,
            { _id: false },
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
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findById('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('findByIdOrThrow', () => {
      it('should throw if document doest not exists', async () => {
        const documentRef = mock<TestDocumentReference>()
        const snapshot = mock<TestDocumentSnapshot>()
        snapshot.exists.mockReturnValue(false)
        jest.mocked(getDoc).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

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
        jest.mocked(firestoreZodDocument).mockReturnValue(documentRef)

        await expect(collection.findByIdOrThrow('id')).resolves.toEqual(parsedDocumentValue)
      })
    })

    describe('query', () => {
      it('should invoke firestoreZodCollection', async () => {
        const collectionRef = mock<TestCollectionReference>()
        const snapshot = mock<TestQuerySnapshot>({ empty: true })
        jest.mocked(getDocs).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

        await collection.query({ name: 'test' }, { _id: false })

        expect(firestoreZodCollection).toHaveBeenCalledWith(
          ['foo'],
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
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

  describe('without specified getFirestore', () => {
    let collection: MultiDocumentCollectionFactory<{ zod: typeof TestDocumentZod }>

    beforeEach(() => {
      collection = multiDocumentCollectionFactory('foo', TestDocumentZod)
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreCollectionWithConverter).toHaveBeenCalledWith(['foo'], MockDataConverter, undefined)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreDocumentWithConverter).toHaveBeenCalledWith(['foo'], 'id', MockDataConverter, undefined)
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreCollectionGroupWithConverter).toHaveBeenCalledWith('foo', MockDataConverter, undefined)
      })
    })
    describe('read with options', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _id: false })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, { _id: false }, {})
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id', { _id: false })

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, { _id: false }, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _id: false })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _id: false }, {})
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
      let subCollection: MultiDocumentCollectionFactory<{ zod: typeof TestDocumentZod }>

      beforeEach(() => {
        subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, ['root', 'parent'], {})
      })

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection()

          expect(firestoreCollectionWithConverter).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            MockDataConverter,
            undefined,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreDocumentWithConverter).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            MockDataConverter,
            undefined,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreCollectionGroupWithConverter).toHaveBeenCalledWith('foo', MockDataConverter, undefined)
        })
      })

      describe('read with options', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection({ _id: false })

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            { _id: false },
            {},
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id', { _id: false })

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            { _id: false },
            {},
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup({ _id: false })

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _id: false }, {})
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
  })

  describe('with specified meta options', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod)

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _metadata: true })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, { _metadata: true }, {})
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id', { _metadata: true })

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, { _metadata: true }, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _metadata: true })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _metadata: true }, {})
      })
    })

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory('foo', TestDocumentZod, ['root', 'parent'], {})

      describe('read', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection({ _metadata: true })

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            { _metadata: true },
            {},
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id', { _metadata: true })

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            { _metadata: true },
            {},
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup({ _metadata: true })

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, { _metadata: true }, {})
        })
      })
    })
  })

  describe('with specified includeDocumentIdForZod and zodErrorHandler', () => {
    const zodErrorHandler = jest.fn()
    const firestoreZodOptions = {
      includeDocumentIdForZod: true,
      zodErrorHandler,
    }

    let collection: MultiDocumentCollectionFactory<{ zod: typeof TestDocumentZod }>
    beforeEach(() => {
      collection = multiDocumentCollectionFactory('foo', TestDocumentZod, undefined, firestoreZodOptions)
    })

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreCollectionWithConverter).toHaveBeenCalledWith(['foo'], MockDataConverter, undefined)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreDocumentWithConverter).toHaveBeenCalledWith(['foo'], 'id', MockDataConverter, undefined)
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreCollectionGroupWithConverter).toHaveBeenCalledWith('foo', MockDataConverter, undefined)
      })
    })

    describe('read with options', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection({ _id: false })

        expect(firestoreZodCollection).toHaveBeenCalledWith(
          ['foo'],
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id', { _id: false })

        expect(firestoreZodDocument).toHaveBeenCalledWith(
          ['foo'],
          'id',
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup({ _id: false })

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
          'foo',
          TestDocumentZod,
          { _id: false },
          firestoreZodOptions,
        )
      })
    })

    describe('for sub-collection', () => {
      const subCollection = multiDocumentCollectionFactory(
        'foo',
        TestDocumentZod,
        ['root', 'parent'],
        firestoreZodOptions,
      )

      describe('read with options', () => {
        it('should invoke firestoreZodCollection', () => {
          subCollection.read.collection({ _id: false })

          expect(firestoreZodCollection).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            TestDocumentZod,
            { _id: false },
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id', { _id: false })

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            { _id: false },
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup({ _id: false })

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith(
            'foo',
            TestDocumentZod,
            { _id: false },
            firestoreZodOptions,
          )
        })
      })
    })
  })
})
