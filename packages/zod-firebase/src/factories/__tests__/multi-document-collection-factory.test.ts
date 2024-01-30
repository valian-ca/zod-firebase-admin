import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentReference,
  getDocs,
  getFirestore,
  setDoc,
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
  type ZodCollectionReference,
  type ZodQuerySnapshot,
} from '../../base'
import { multiDocumentCollectionFactory } from '../multi-document-collection-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('multiDocumentCollectionFactory', () => {
  describe('with specified getFirestore option', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod, { getFirestore })
    const firestoreZodOptions = { firestore: getFirestore() }

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, firestoreZodOptions)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, firestoreZodOptions)
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
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, firestoreZodOptions)
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

    describe('query', () => {
      it('should invoke firestoreZodCollection', async () => {
        const collectionRef = mock<ZodCollectionReference>()
        const snapshot = mock<ZodQuerySnapshot>({ empty: true })
        jest.mocked(getDocs).mockResolvedValue(snapshot)
        jest.mocked(firestoreZodCollection).mockReturnValue(collectionRef)

        await collection.query({ name: 'test' })

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, firestoreZodOptions)
      })
    })

    describe('add', () => {
      it('should invoke add on firestoreCollection', async () => {
        const collectionRef = mock<CollectionReference>()
        jest.mocked(firestoreCollection).mockReturnValue(collectionRef)

        await collection.add({ name: 'test' })

        expect(addDoc).toHaveBeenCalledWith(collectionRef, { name: 'test' })
      })
    })

    describe('set', () => {
      it('should invoke set on firestoreDocument with options', async () => {
        const docRef = mock<DocumentReference>()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.set('bar', { name: 'test' }, { merge: true })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
        expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' }, { merge: true })
      })

      it('should invoke set on firestoreDocument without options', async () => {
        const docRef = mock<DocumentReference>()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.set('bar', { name: 'test' })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
        expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
      })
    })

    describe('update', () => {
      it('should invoke update on firestoreDocument', async () => {
        const docRef = mock<DocumentReference>()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.update('bar', { name: 'test' })

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
        expect(updateDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
      })
    })

    describe('delete', () => {
      it('should invoke delete on firestoreDocument', async () => {
        const docRef = mock<DocumentReference>()
        jest.mocked(firestoreDocument).mockReturnValue(docRef)

        await collection.delete('bar')

        expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'bar', getFirestore())
        expect(deleteDoc).toHaveBeenCalledWith(docRef)
      })
    })
  })

  describe('without specified getFirestore', () => {
    const collection = multiDocumentCollectionFactory('foo', TestDocumentZod)

    describe('read', () => {
      it('should invoke firestoreZodCollection', () => {
        collection.read.collection()

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, {})
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, {})
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, {})
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

          expect(firestoreZodCollection).toHaveBeenCalledWith(['root', 'parent', 'foo'], TestDocumentZod, {})
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(['root', 'parent', 'foo'], 'id', TestDocumentZod, {})
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, {})
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

        expect(firestoreZodCollection).toHaveBeenCalledWith(['foo'], TestDocumentZod, firestoreZodOptions)
      })

      it('should invoke firestoreZodDocument', () => {
        collection.read.doc('id')

        expect(firestoreZodDocument).toHaveBeenCalledWith(['foo'], 'id', TestDocumentZod, firestoreZodOptions)
      })

      it('should invoke firestoreZodCollectionGroup', () => {
        collection.read.collectionGroup()

        expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, firestoreZodOptions)
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
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodDocument', () => {
          subCollection.read.doc('id')

          expect(firestoreZodDocument).toHaveBeenCalledWith(
            ['root', 'parent', 'foo'],
            'id',
            TestDocumentZod,
            firestoreZodOptions,
          )
        })

        it('should invoke firestoreZodCollectionGroup', () => {
          subCollection.read.collectionGroup()

          expect(firestoreZodCollectionGroup).toHaveBeenCalledWith('foo', TestDocumentZod, firestoreZodOptions)
        })
      })
    })
  })
})
