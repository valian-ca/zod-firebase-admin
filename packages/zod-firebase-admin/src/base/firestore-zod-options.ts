import type { Firestore } from 'firebase-admin/firestore'

import type { FirestoreZodDataConverterOptions } from './firestore-zod-data-converter'

export type FirestoreZodOptions = FirestoreZodDataConverterOptions & {
  readonly firestore?: Firestore
}
