import {
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
} from '@firebase/firestore'
import { vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

export const { Timestamp } = await vi.importActual('firebase/firestore')

export const getFirestore = vi.fn().mockReturnValue(mock())

const collectionReferenceMock = mock<CollectionReference>()
collectionReferenceMock.withConverter.mockReturnThis()
export const collection = vi.fn().mockReturnValue(collectionReferenceMock)

const collectionGroupReferenceMock = mock<Query>()
collectionGroupReferenceMock.withConverter.mockReturnThis()

export const collectionGroup = vi.fn().mockReturnValue(collectionGroupReferenceMock)

const documentReferenceMock = mock<DocumentReference>()
documentReferenceMock.withConverter.mockReturnThis()
export const doc = vi.fn().mockReturnValue(documentReferenceMock)

const mockQuerySnapshot = mock<QuerySnapshot>()
export const getDocs = vi.fn().mockReturnValue(mockQuerySnapshot)

const mockDocumentSnapshot = mock<DocumentSnapshot>()
export const getDoc = vi.fn().mockReturnValue(mockDocumentSnapshot)

export const where = vi.fn().mockReturnValue(mock())
export const orderBy = vi.fn().mockReturnValue(mock())
export const limit = vi.fn().mockReturnValue(mock())
export const limitToLast = vi.fn().mockReturnValue(mock())
export const startAt = vi.fn().mockReturnValue(mock())
export const startAfter = vi.fn().mockReturnValue(mock())
export const endAt = vi.fn().mockReturnValue(mock())
export const endBefore = vi.fn().mockReturnValue(mock())
export const query = vi.fn().mockReturnValue(mock())

export const addDoc = vi.fn().mockResolvedValue(undefined!)
export const setDoc = vi.fn().mockResolvedValue(undefined!)
export const updateDoc = vi.fn().mockResolvedValue(undefined!)
export const deleteDoc = vi.fn().mockResolvedValue(undefined!)

export const getAggregateFromServer = vi.fn().mockReturnValue(mock())
export const count = vi.fn().mockReturnValue(mock())
