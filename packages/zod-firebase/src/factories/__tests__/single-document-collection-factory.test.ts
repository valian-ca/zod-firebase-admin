import { deleteDoc, type DocumentReference, getFirestore, setDoc, updateDoc } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

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

  describe('set', () => {
    it('should invoke set on firestoreDocument with options', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.set({ name: 'test' }, { merge: true })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(setDoc).toHaveBeenCalledWith(docRef, { name: 'test' }, { merge: true })
    })
  })

  describe('update', () => {
    it('should invoke update on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.update({ name: 'test' })

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(updateDoc).toHaveBeenCalledWith(docRef, { name: 'test' })
    })
  })

  describe('delete', () => {
    it('should invoke delete on firestoreDocument', async () => {
      const docRef = mock<DocumentReference>()
      jest.mocked(firestoreDocument).mockReturnValue(docRef)

      await collection.delete()

      expect(firestoreDocument).toHaveBeenCalledWith(['foo'], 'KEY', getFirestore())
      expect(deleteDoc).toHaveBeenCalledWith(docRef)
    })
  })
})
