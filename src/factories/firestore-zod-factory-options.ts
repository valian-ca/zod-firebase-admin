import type { getFirestore } from 'firebase-admin/firestore'

import type { ZodErrorHandler } from '../base'

export type FirestoreZodFactoryOptions = {
  readonly getFirestore?: typeof getFirestore
  readonly zodErrorHandler?: ZodErrorHandler
}
