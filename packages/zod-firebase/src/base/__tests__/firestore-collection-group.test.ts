import { collectionGroup, getFirestore } from '@firebase/firestore'
import { describe, expect, it, vi } from 'vitest'

import { firestoreCollectionGroup } from '../firestore-collection-group'

vi.mock('@firebase/firestore')

describe('firestoreCollectionGroup', () => {
  it('should invoke collectionGroup(getFirestore(), name)', () => {
    firestoreCollectionGroup('foo')
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})
