import { collection, getFirestore } from '@firebase/firestore'
import { describe, expect, it, vi } from 'vitest'

import { firestoreCollection } from '../firestore-collection'

vi.mock('@firebase/firestore')

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
