import type { getFirestore } from 'firebase-admin/firestore'

import type { FirestoreZodDataConverterOptions } from '../base/firestore-zod-data-converter'

export type FirestoreZodFactoryOptions = FirestoreZodDataConverterOptions & {
  readonly getFirestore: typeof getFirestore
}
