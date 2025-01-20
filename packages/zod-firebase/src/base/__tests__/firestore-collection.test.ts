import { collection, getFirestore } from '@firebase/firestore'

import { firestoreCollection } from '../firestore-collection'

describe('firestoreCollection', () => {
  it('should invoke collection(getFirestore(), name)', () => {
    firestoreCollection('foo')
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo')
  })

  it('should invoke collection(getFirestore(), name) for subCollection', () => {
    firestoreCollection(['foo', 'id', 'bar'])
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'foo/id/bar')
  })
})
