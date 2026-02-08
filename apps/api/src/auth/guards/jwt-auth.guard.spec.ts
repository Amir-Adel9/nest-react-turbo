import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('is defined and has canActivate', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
});
