import { mock } from 'jest-mock-extended'
import { type Query, Filter } from 'firebase-admin/firestore'
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
})
