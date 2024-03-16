import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'

import { firestoreZodCollection } from '../../base'
import { collectionWithSubCollectionsFactory } from '../collections-factory'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

const TestSubCollectionDocumentZod = z.object({
  value: z.number(),
})

describe('collectionWithSubCollectionsFactory', () => {
  describe('without sub-collections', () => {
    it('should invoke collectionFactory', () => {
      const collectionWithoutSubCollection = collectionWithSubCollectionsFactory(
        'foo',
        { zod: TestDocumentZod },
        { getFirestore },
      )

      expect(typeof collectionWithoutSubCollection).not.toBe('function')
    })
  })

  describe('with sub-collections', () => {
    it('should invoke collectionFactory', () => {
      const collectionWithSubCollection = collectionWithSubCollectionsFactory(
        'foo',
        { zod: TestDocumentZod, test: { zod: TestSubCollectionDocumentZod } },
        { getFirestore },
      )

      expect(typeof collectionWithSubCollection).toBe('function')

      collectionWithSubCollection('id').test.read.collection()

      expect(firestoreZodCollection).toHaveBeenCalledWith(
        ['foo', 'id', 'test'],
        TestSubCollectionDocumentZod,
        undefined,
        {
          firestore: getFirestore(),
        },
      )
    })
  })
})
