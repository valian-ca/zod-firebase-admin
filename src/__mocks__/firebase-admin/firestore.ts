import type {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QuerySnapshot,
} from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const { Filter, Timestamp } = jest.requireActual('firebase-admin/firestore')

const mockFirestore = mock<Firestore>()
export const getFirestore = jest.fn().mockReturnValue(mockFirestore)

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
