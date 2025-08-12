import { limit, orderBy, type Query, where } from '@firebase/firestore'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { applyQuerySpecification } from '../query-specification'

vi.mock('@firebase/firestore')

describe('applyQuerySpecification', () => {
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
})
