import type { DocumentData, getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore'

import type { ZodErrorHandler } from '../base'

export interface FirestoreZodFactoryOptions {
  readonly getFirestore?: typeof getFirestore
  readonly zodErrorHandler?: ZodErrorHandler
  readonly snapshotDataConverter?: (snapshot: QueryDocumentSnapshot) => DocumentData
}
