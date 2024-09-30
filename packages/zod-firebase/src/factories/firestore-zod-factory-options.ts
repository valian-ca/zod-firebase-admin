import { type DocumentData, type getFirestore, type QueryDocumentSnapshot } from 'firebase/firestore'

import { type ZodErrorHandler } from '../base'

export interface FirestoreZodFactoryOptions {
  readonly getFirestore?: typeof getFirestore
  readonly zodErrorHandler?: ZodErrorHandler
  readonly snapshotDataConverter?: (snapshot: QueryDocumentSnapshot) => DocumentData
}
