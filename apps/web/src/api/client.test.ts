import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from './client';

describe('extractErrorMessage', () => {
  it('returns message from response body when err has response', async () => {
    const res = {
      clone: () => ({ json: () => Promise.resolve({ message: 'Email already exists' }) }),
    } as unknown as Response;
    const err = Object.assign(new Error('401'), { response: res });
    const result = await extractErrorMessage(err, 'Fallback');
    expect(result).toBe('Email already exists');
  });

  it('returns fallback when body has no message', async () => {
    const res = {
      clone: () => ({ json: () => Promise.resolve({}) }),
    } as unknown as Response;
    const err = Object.assign(new Error('401'), { response: res });
    const result = await extractErrorMessage(err, 'Fallback');
    expect(result).toBe('Fallback');
  });

  it('returns fallback when response body is not JSON', async () => {
    const res = {
      clone: () => ({ json: () => Promise.reject(new Error('parse error')) }),
    } as unknown as Response;
    const err = Object.assign(new Error('500'), { response: res });
    const result = await extractErrorMessage(err, 'Fallback');
    expect(result).toBe('Fallback');
  });

  it('returns Error message when err is Error without response', async () => {
    const result = await extractErrorMessage(new Error('Network error'), 'Fallback');
    expect(result).toBe('Network error');
  });

  it('returns fallback when err is not an object with response', async () => {
    const result = await extractErrorMessage('string error', 'Fallback');
    expect(result).toBe('Fallback');
  });

  it('uses default fallback when not provided', async () => {
    const result = await extractErrorMessage('oops');
    expect(result).toBe('Something went wrong');
  });
});
