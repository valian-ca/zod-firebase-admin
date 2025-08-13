import {
  endAt,
  endBefore,
  limit,
  limitToLast,
  orderBy,
  type Query,
  query as firestoreQuery,
  startAfter,
  startAt,
  where,
} from '@firebase/firestore'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { applyQuerySpecification } from '../query-specification'

vi.mock('@firebase/firestore')

describe('applyQuerySpecification', () => {
  it('should pass through prebuilt constraints', () => {
    const q = mock<Query>()
    const c1 = where('foo', '==', 'bar')
    const c2 = orderBy('baz')
    applyQuerySpecification(q, {
      name: 'test',
      constraints: [c1, c2],
    })

    expect(firestoreQuery).toHaveBeenCalledWith(q, c1, c2)
  })

  describe('where', () => {
    it('should apply where conditions', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        where: [['test', '==', 'value']],
      })

      expect(where).toHaveBeenCalledWith('test', '==', 'value')
    })
  })

  describe('orderBy', () => {
    it('should apply orderBy to query with default direction', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        orderBy: [['test']],
      })

      expect(orderBy).toHaveBeenCalledWith('test', undefined)
    })

    it('should apply orderBy to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        orderBy: [['test', 'asc']],
      })

      expect(orderBy).toHaveBeenCalledWith('test', 'asc')
    })
  })

  describe('limit', () => {
    it('should apply limit to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        limit: 2,
      })

      expect(limit).toHaveBeenCalledWith(2)
    })
  })

  describe('limitToLast', () => {
    it('should apply limitToLast to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        limitToLast: 3,
      })

      expect(limitToLast).toHaveBeenCalledWith(3)
    })
  })

  describe('cursor constraints', () => {
    it('should apply startAt', () => {
      const query = mock<Query>()
      const values = ['a', 1]
      applyQuerySpecification(query, {
        name: 'test',
        startAt: values,
      })

      expect(startAt).toHaveBeenCalledWith(...values)
    })

    it('should apply startAfter', () => {
      const query = mock<Query>()
      const values = ['b', 2]
      applyQuerySpecification(query, {
        name: 'test',
        startAfter: values,
      })

      expect(startAfter).toHaveBeenCalledWith(...values)
    })

    it('should apply endAt', () => {
      const query = mock<Query>()
      const values = ['c', 3]
      applyQuerySpecification(query, {
        name: 'test',
        endAt: values,
      })

      expect(endAt).toHaveBeenCalledWith(...values)
    })

    it('should apply endBefore', () => {
      const query = mock<Query>()
      const values = ['d', 4]
      applyQuerySpecification(query, {
        name: 'test',
        endBefore: values,
      })

      expect(endBefore).toHaveBeenCalledWith(...values)
    })
  })
})
