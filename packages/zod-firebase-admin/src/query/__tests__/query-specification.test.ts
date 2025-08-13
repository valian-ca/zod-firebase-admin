import { Filter, type Query } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { applyQuerySpecification } from '../query-specification'

describe('applyQuerySpecification', () => {
  describe('where', () => {
    it('should apply where conditions', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        where: [['test', '==', 'value']],
      })

      expect(query.where).toHaveBeenCalledWith('test', '==', 'value')
    })

    it('should apply where filter', () => {
      const query = mock<Query>()
      const filter = Filter.where('test', '==', 'value')
      applyQuerySpecification(query, {
        name: 'test',
        where: filter,
      })

      expect(query.where).toHaveBeenCalledWith(filter)
    })
  })

  describe('orderBy', () => {
    it('should apply orderBy to query with default direction', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        orderBy: [['test']],
      })

      expect(query.orderBy).toHaveBeenCalledWith('test', undefined)
    })

    it('should apply orderBy to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        orderBy: [['test', 'asc']],
      })

      expect(query.orderBy).toHaveBeenCalledWith('test', 'asc')
    })
  })

  describe('limit', () => {
    it('should apply limit to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        limit: 2,
      })

      expect(query.limit).toHaveBeenCalledWith(2)
    })
  })

  describe('limitToLast', () => {
    it('should apply limitToLast to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        limitToLast: 5,
      })

      expect(query.limitToLast).toHaveBeenCalledWith(5)
    })
  })

  describe('offset', () => {
    it('should apply offset to query', () => {
      const query = mock<Query>()
      applyQuerySpecification(query, {
        name: 'test',
        offset: 7,
      })

      expect(query.offset).toHaveBeenCalledWith(7)
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

      expect(query.startAt).toHaveBeenCalledWith(...values)
    })

    it('should apply startAfter', () => {
      const query = mock<Query>()
      const values = ['b', 2]
      applyQuerySpecification(query, {
        name: 'test',
        startAfter: values,
      })

      expect(query.startAfter).toHaveBeenCalledWith(...values)
    })

    it('should apply endAt', () => {
      const query = mock<Query>()
      const values = ['c', 3]
      applyQuerySpecification(query, {
        name: 'test',
        endAt: values,
      })

      expect(query.endAt).toHaveBeenCalledWith(...values)
    })

    it('should apply endBefore', () => {
      const query = mock<Query>()
      const values = ['d', 4]
      applyQuerySpecification(query, {
        name: 'test',
        endBefore: values,
      })

      expect(query.endBefore).toHaveBeenCalledWith(...values)
    })
  })
})
