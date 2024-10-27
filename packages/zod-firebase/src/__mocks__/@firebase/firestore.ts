import {
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
} from '@firebase/firestore'
import { mock } from 'jest-mock-extended'

export const { Timestamp } = jest.requireActual('firebase/firestore')

export const getFirestore = jest.fn().mockReturnValue(mock())

const collectionReferenceMock = mock<CollectionReference>()
collectionReferenceMock.withConverter.mockReturnThis()
export const collection = jest.fn().mockReturnValue(collectionReferenceMock)

const collectionGroupReferenceMock = mock<Query>()
collectionGroupReferenceMock.withConverter.mockReturnThis()

export const collectionGroup = jest.fn().mockReturnValue(collectionGroupReferenceMock)

const documentReferenceMock = mock<DocumentReference>()
documentReferenceMock.withConverter.mockReturnThis()
export const doc = jest.fn().mockReturnValue(documentReferenceMock)

const mockQuerySnapshot = mock<QuerySnapshot>()
export const getDocs = jest.fn().mockReturnValue(mockQuerySnapshot)

const mockDocumentSnapshot = mock<DocumentSnapshot>()
export const getDoc = jest.fn().mockReturnValue(mockDocumentSnapshot)

export const where = jest.fn().mockReturnValue(mock())
export const orderBy = jest.fn().mockReturnValue(mock())
export const limit = jest.fn().mockReturnValue(mock())
export const query = jest.fn().mockReturnValue(mock())

export const addDoc = jest.fn().mockResolvedValue(undefined!)
export const setDoc = jest.fn().mockResolvedValue(undefined!)
export const updateDoc = jest.fn().mockResolvedValue(undefined!)
export const deleteDoc = jest.fn().mockResolvedValue(undefined!)

export const getAggregateFromServer = jest.fn().mockReturnValue(mock())
export const count = jest.fn().mockReturnValue(mock())
