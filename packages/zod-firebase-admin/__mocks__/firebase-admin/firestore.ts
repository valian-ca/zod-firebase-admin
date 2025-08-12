import {
  type CollectionGroup,
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QuerySnapshot,
} from 'firebase-admin/firestore'
import { vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

export const { Filter, Timestamp } = await vi.importActual('firebase-admin/firestore')

const mockFirestore = mock<Firestore>()
export const getFirestore = vi.fn().mockReturnValue(mockFirestore)

const mockCollection = mock<CollectionReference>()
mockCollection.withConverter.mockReturnThis()
mockCollection.where.mockReturnThis()
mockCollection.orderBy.mockReturnThis()
mockCollection.limit.mockReturnThis()
mockFirestore.collection.mockReturnValue(mockCollection)

const mockCollectionGroup = mock<CollectionGroup>()
mockCollectionGroup.withConverter.mockReturnThis()
mockFirestore.collectionGroup.mockReturnValue(mockCollectionGroup)

const mockDocument = mock<DocumentReference>()
mockDocument.withConverter.mockReturnThis()
mockFirestore.doc.mockReturnValue(mockDocument)

const mockQuerySnapshot = mock<QuerySnapshot>()
mockCollection.get.mockResolvedValue(mockQuerySnapshot)
mockCollectionGroup.get.mockResolvedValue(mockQuerySnapshot)

const mockDocumentSnapshot = mock<DocumentSnapshot>()
mockDocument.get.mockResolvedValue(mockDocumentSnapshot)
