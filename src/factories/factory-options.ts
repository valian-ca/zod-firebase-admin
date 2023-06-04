import type { Firestore } from 'firebase-admin/firestore'

export type FactoryOptions = {
  getFirestore: () => Firestore
}
