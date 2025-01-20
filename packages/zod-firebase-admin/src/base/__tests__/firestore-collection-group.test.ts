import { getFirestore } from 'firebase-admin/firestore'

import { firestoreCollectionGroup } from '../firestore-collection-group'

describe('firestoreCollectionGroup', () => {
  it('should invoke getFirestore().collectionGroup', () => {
    firestoreCollectionGroup('foo')
    expect(getFirestore().collectionGroup).toHaveBeenCalledWith('foo')
  })
})
