import { describe, it, expect } from 'vitest';
import { formatResponse, formatError } from '../src/lib/api-utils';
import { QueryBuilder as Qb2 } from '../src/lib/query-builder';

describe('API Utils', () => {
  it('should format success response correctly', () => {
    const data = { id: 1, name: 'Test' };
    const res = formatResponse(data);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
    expect(res.meta).toBeDefined();
    expect(res.meta?.timestamp).toBeDefined();
  });

  it('should format error response correctly', () => {
    const errorMsg = 'Not found';
    const code = 404;
    const res = formatError(errorMsg, code);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(errorMsg);
  });
});

describe('QueryBuilder', () => {
  it('should build pagination and filter query correctly', () => {
    const query = { page: '2', limit: '10', isVerified: 'true' };
    const qb = new Qb2(query).filter(['isVerified']).paginate();
    const args = qb.build();
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.where.isVerified).toBe(true);
  });
});
