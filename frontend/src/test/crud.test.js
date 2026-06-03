import { describe, it, expect } from 'vitest'
import { initialResources } from '../data/store'

function createStore(initial) {
  let resources = [...initial]
  let nextId = initial.length + 1

  return {
    getAll: () => resources,
    add: (data) => {
      const item = { ...data, id: nextId++ }
      resources = [...resources, item]
      return item
    },
    update: (data) => {
      resources = resources.map(r => r.id === data.id ? data : r)
    },
    delete: (id) => {
      resources = resources.filter(r => r.id !== id)
    },
    findById: (id) => resources.find(r => r.id === id),
  }
}

describe('CRUD operations (in-memory)', () => {
  const newResource = {
    name: 'Test Resource',
    department: 'IT',
    type: 'Video',
    unlockCondition: 'Test condition',
    rating: 4.2,
    views: 10,
    dateAdded: '2026-03-01',
  }

  it('Read: returns all initial resources', () => {
    const store = createStore(initialResources)
    expect(store.getAll().length).toBe(initialResources.length)
  })

  it('Create: adds a new resource with a unique id', () => {
    const store = createStore(initialResources)
    const before = store.getAll().length
    const added = store.add(newResource)
    expect(store.getAll().length).toBe(before + 1)
    expect(added.id).toBeDefined()
    expect(added.name).toBe('Test Resource')
  })

  it('Create: multiple adds produce unique ids', () => {
    const store = createStore([])
    const a = store.add(newResource)
    const b = store.add({ ...newResource, name: 'Second' })
    expect(a.id).not.toBe(b.id)
  })

  it('Update: modifies an existing resource', () => {
    const store = createStore(initialResources)
    const original = store.getAll()[0]
    store.update({ ...original, name: 'Updated Name' })
    const updated = store.findById(original.id)
    expect(updated.name).toBe('Updated Name')
  })

  it('Update: does not change the total count', () => {
    const store = createStore(initialResources)
    const before = store.getAll().length
    store.update({ ...store.getAll()[0], name: 'Changed' })
    expect(store.getAll().length).toBe(before)
  })

  it('Delete: removes resource by id', () => {
    const store = createStore(initialResources)
    const before = store.getAll().length
    const idToDelete = store.getAll()[0].id
    store.delete(idToDelete)
    expect(store.getAll().length).toBe(before - 1)
    expect(store.findById(idToDelete)).toBeUndefined()
  })

  it('Delete: deleting non-existent id changes nothing', () => {
    const store = createStore(initialResources)
    const before = store.getAll().length
    store.delete(99999)
    expect(store.getAll().length).toBe(before)
  })

  it('Read: findById returns correct resource', () => {
    const store = createStore(initialResources)
    const first = initialResources[0]
    const found = store.findById(first.id)
    expect(found).toBeDefined()
    expect(found.name).toBe(first.name)
  })

  it('Read: findById returns undefined for missing id', () => {
    const store = createStore(initialResources)
    expect(store.findById(99999)).toBeUndefined()
  })
})
