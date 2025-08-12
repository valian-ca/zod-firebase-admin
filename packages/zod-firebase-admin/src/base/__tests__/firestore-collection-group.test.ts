import { getFirestore } from 'firebase-admin/firestore'
import { describe, expect, it, vi } from 'vitest'

import { firestoreCollectionGroup } from '../firestore-collection-group'

vi.mock('firebase-admin/firestore')

describe('firestoreCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroup('foo')
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})
