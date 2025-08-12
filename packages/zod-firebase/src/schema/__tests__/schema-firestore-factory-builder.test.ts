import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { z } from 'zod'

import { schemaFirestoreFactoryBuilder } from '../schema-firestore-factory-builder'
import { schemaFirestoreQueryFactory } from '../schema-firestore-query-factory'
import {
  type SchemaFirestoreReadFactoryBuilder,
  schemaFirestoreReadFactoryBuilder,
} from '../schema-firestore-read-factory-builder'
import {
  type SchemaFirestoreWriteFactoryBuilder,
  schemaFirestoreWriteFactoryBuilder,
} from '../schema-firestore-write-factory-builder'
import { type SchemaFirestoreQueryFactory, type SchemaFirestoreReadFactory } from '../types'

vi.mock('../schema-firestore-query-factory')
vi.mock('../schema-firestore-read-factory-builder')
vi.mock('../schema-firestore-write-factory-builder')

const TestDocumentZod = z.object({
  name: z.string(),
})

const mockedQueryFactory = mock<SchemaFirestoreQueryFactory<{ zod: typeof TestDocumentZod }>>()
const mockedReadFactoryBuilder = mock<SchemaFirestoreReadFactoryBuilder<{ zod: typeof TestDocumentZod }>>()
const mockedReadFactory = mock<SchemaFirestoreReadFactory<{ zod: typeof TestDocumentZod }>>()
const mockedWriteFactoryBuilder = mock<SchemaFirestoreWriteFactoryBuilder<{ zod: typeof TestDocumentZod }>>()

mockedReadFactoryBuilder.build.mockReturnValue(mockedReadFactory)

vi.mocked(schemaFirestoreQueryFactory).mockReturnValue(mockedQueryFactory)
vi.mocked(schemaFirestoreReadFactoryBuilder).mockReturnValue(mockedReadFactoryBuilder)
vi.mocked(schemaFirestoreWriteFactoryBuilder).mockReturnValue(mockedWriteFactoryBuilder)

describe('schemaFirestoreFactoryBuilder', () => {
  it('should invoke read and write builder', () => {
    schemaFirestoreFactoryBuilder('foo', { zod: TestDocumentZod })

    expect(schemaFirestoreReadFactoryBuilder).toHaveBeenCalledWith('foo', { zod: TestDocumentZod }, undefined)
    expect(schemaFirestoreWriteFactoryBuilder).toHaveBeenCalledWith('foo', { zod: TestDocumentZod }, undefined)
  })

  describe('build', () => {
    it('should invoke read, write and query factory', () => {
      schemaFirestoreFactoryBuilder('foo', { zod: TestDocumentZod }).build()

      expect(schemaFirestoreQueryFactory).toHaveBeenCalledWith(mockedReadFactory.collection, 'foo')
      expect(mockedReadFactoryBuilder.build).toHaveBeenCalledWith(undefined)
      expect(mockedWriteFactoryBuilder.build).toHaveBeenCalledWith(undefined)
    })
  })

  describe('build with parent path', () => {
    it('should invoke read, write and query factory', () => {
      schemaFirestoreFactoryBuilder('foo', { zod: TestDocumentZod }).build(['foo', 'ID'])

      expect(schemaFirestoreQueryFactory).toHaveBeenCalledWith(mockedReadFactory.collection, 'foo')
      expect(mockedReadFactoryBuilder.build).toHaveBeenCalledWith(['foo', 'ID'])
      expect(mockedWriteFactoryBuilder.build).toHaveBeenCalledWith(['foo', 'ID'])
    })
  })
})
