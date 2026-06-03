import { describe, it, expect } from 'vitest'
import { validateLogin, validateSignUp, validateResource } from '../hooks/useValidation'

//validateLogin 
describe('validateLogin', () => {
  const valid = { email: 'user@example.com', password: 'pass1' }

  it('passes with valid credentials', () => {
    expect(validateLogin(valid)).toEqual({})
  })

  it('fails with empty email', () => {
    expect(validateLogin({ ...valid, email: '' }).email).toBeDefined()
  })

  it('fails with email missing @', () => {
    expect(validateLogin({ ...valid, email: 'notanemail' }).email).toBeDefined()
  })

  it('fails with email missing domain', () => {
    expect(validateLogin({ ...valid, email: 'user@' }).email).toBeDefined()
  })

  it('passes with subdomain email', () => {
    expect(validateLogin({ ...valid, email: 'user@mail.co.uk' }).email).toBeUndefined()
  })

  it('fails with password shorter than 4 chars', () => {
    expect(validateLogin({ ...valid, password: 'abc' }).password).toBeDefined()
  })

  it('fails with empty password', () => {
    expect(validateLogin({ ...valid, password: '' }).password).toBeDefined()
  })

  it('passes with password of exactly 4 chars', () => {
    expect(validateLogin({ ...valid, password: 'abcd' }).password).toBeUndefined()
  })

  it('returns both errors when both fields are invalid', () => {
    const errs = validateLogin({ email: 'bad', password: 'x' })
    expect(errs.email).toBeDefined()
    expect(errs.password).toBeDefined()
  })
})

//validateSignUp
describe('validateSignUp', () => {
  const valid = {
    fullName: 'Ion Popescu',
    email: 'ion@company.com',
    password: 'secret123',
    confirm: 'secret123',
    department: 'IT',
  }

  it('passes with valid data', () => {
    expect(validateSignUp(valid)).toEqual({})
  })

  it('fails when fullName is shorter than 2 chars', () => {
    expect(validateSignUp({ ...valid, fullName: 'A' }).fullName).toBeDefined()
  })

  it('fails when fullName is empty', () => {
    expect(validateSignUp({ ...valid, fullName: '' }).fullName).toBeDefined()
  })

  it('fails when fullName is only whitespace', () => {
    expect(validateSignUp({ ...valid, fullName: '  ' }).fullName).toBeDefined()
  })

  it('fails with invalid email', () => {
    expect(validateSignUp({ ...valid, email: 'noemail' }).email).toBeDefined()
  })

  it('fails when password is shorter than 6 chars', () => {
    expect(validateSignUp({ ...valid, password: 'abc', confirm: 'abc' }).password).toBeDefined()
  })

  it('fails when passwords do not match', () => {
    expect(validateSignUp({ ...valid, confirm: 'different' }).confirm).toBeDefined()
  })

  it('passes when passwords match', () => {
    expect(validateSignUp(valid).confirm).toBeUndefined()
  })

  it('fails when department is empty', () => {
    expect(validateSignUp({ ...valid, department: '' }).department).toBeDefined()
  })

  it('passes with any non-empty department', () => {
    expect(validateSignUp({ ...valid, department: 'HR' }).department).toBeUndefined()
  })
})
// validateResource
describe('validateResource', () => {
  const valid = {
    name: 'Test Resource',
    department: 'IT',
    type: 'Video',
    unlockCondition: 'Complete module 1',
    rating: 4.5,
    dateAdded: '2026-01-15',
  }

  it('passes with all valid fields', () => {
    expect(validateResource(valid)).toEqual({})
  })

  it('fails when name is missing', () => {
    expect(validateResource({ ...valid, name: '' }).name).toBeDefined()
  })

  it('fails when name is too short (< 3 chars)', () => {
    expect(validateResource({ ...valid, name: 'ab' }).name).toBeDefined()
  })

  it('passes when name is exactly 3 chars', () => {
    expect(validateResource({ ...valid, name: 'abc' }).name).toBeUndefined()
  })

  it('fails when department is missing', () => {
    expect(validateResource({ ...valid, department: '' }).department).toBeDefined()
  })

  it('fails when type is missing', () => {
    expect(validateResource({ ...valid, type: '' }).type).toBeDefined()
  })

  it('fails when unlockCondition is empty', () => {
    expect(validateResource({ ...valid, unlockCondition: '' }).unlockCondition).toBeDefined()
  })

  it('fails when unlockCondition is only whitespace', () => {
    expect(validateResource({ ...valid, unlockCondition: '   ' }).unlockCondition).toBeDefined()
  })

  it('fails when rating is NaN', () => {
    expect(validateResource({ ...valid, rating: 'abc' }).rating).toBeDefined()
  })

  it('fails when rating > 5', () => {
    expect(validateResource({ ...valid, rating: 5.1 }).rating).toBeDefined()
  })

  it('fails when rating < 0', () => {
    expect(validateResource({ ...valid, rating: -0.1 }).rating).toBeDefined()
  })

  it('passes when rating is exactly 0', () => {
    expect(validateResource({ ...valid, rating: 0 }).rating).toBeUndefined()
  })

  it('passes when rating is exactly 5', () => {
    expect(validateResource({ ...valid, rating: 5 }).rating).toBeUndefined()
  })

  it('fails when dateAdded is missing', () => {
    expect(validateResource({ ...valid, dateAdded: '' }).dateAdded).toBeDefined()
  })

  it('fails when rating is undefined', () => {
    const { rating: _, ...noRating } = valid
    expect(validateResource(noRating).rating).toBeDefined()
  })
})
