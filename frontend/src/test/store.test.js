import { describe, it, expect } from 'vitest'
import { initialResources, DEPARTMENTS, TYPES } from '../data/store'

describe('initialResources', () => {
  it('has at least one resource', () => {
    expect(initialResources.length).toBeGreaterThan(0)
  })

  it('each resource has required fields', () => {
    initialResources.forEach(r => {
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('name')
      expect(r).toHaveProperty('department')
      expect(r).toHaveProperty('type')
      expect(r).toHaveProperty('unlockCondition')
      expect(r).toHaveProperty('rating')
      expect(r).toHaveProperty('views')
      expect(r).toHaveProperty('dateAdded')
    })
  })

  it('all ratings are between 0 and 5', () => {
    initialResources.forEach(r => {
      expect(r.rating).toBeGreaterThanOrEqual(0)
      expect(r.rating).toBeLessThanOrEqual(5)
    })
  })

  it('all ids are unique', () => {
    const ids = initialResources.map(r => r.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all departments are valid', () => {
    initialResources.forEach(r => {
      expect(DEPARTMENTS).toContain(r.department)
    })
  })

  it('all types are valid', () => {
    initialResources.forEach(r => {
      expect(TYPES).toContain(r.type)
    })
  })
})

describe('DEPARTMENTS', () => {
  it('contains IT, HR, Sales, Management, Toate', () => {
    expect(DEPARTMENTS).toContain('IT')
    expect(DEPARTMENTS).toContain('HR')
    expect(DEPARTMENTS).toContain('Sales')
    expect(DEPARTMENTS).toContain('Management')
    expect(DEPARTMENTS).toContain('Toate')
  })
})

describe('TYPES', () => {
  it('contains Video, Quiz, Course, Event', () => {
    expect(TYPES).toContain('Video')
    expect(TYPES).toContain('Quiz')
    expect(TYPES).toContain('Course')
    expect(TYPES).toContain('Event')
  })
})
