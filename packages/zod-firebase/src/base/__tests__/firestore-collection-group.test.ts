import { collectionGroup, getFirestore } from '@firebase/firestore'

import { firestoreCollectionGroup } from '../firestore-collection-group'

describe('firestoreCollectionGroup', () => {
  it('should invoke collectionGroup(getFirestore(), name)', () => {
    firestoreCollectionGroup('foo')
    expect(collectionGroup).toHaveBeenCalledWith(getFirestore(), 'foo')
  })
})
