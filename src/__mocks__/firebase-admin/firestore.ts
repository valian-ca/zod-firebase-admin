import { mock } from 'jest-mock-extended'
import type { CollectionGroup, CollectionReference, DocumentReference, Firestore } from 'firebase-admin/firestore'

const mockFirestore = mock<Firestore>()
export const getFirestore = jest.fn().mockReturnValue(mockFirestore)

const mockCollection = mock<CollectionReference>()
mockCollection.withConverter.mockReturnThis()
mockFirestore.collection.mockReturnValue(mockCollection)

const mockCollectionGroup = mock<CollectionGroup>()
mockCollectionGroup.withConverter.mockReturnThis()
mockFirestore.collectionGroup.mockReturnValue(mockCollectionGroup)

const mockDocument = mock<DocumentReference>()
mockDocument.withConverter.mockReturnThis()
mockFirestore.doc.mockReturnValue(mockDocument)
