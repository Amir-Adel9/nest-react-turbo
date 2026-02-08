import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  it('is defined and has canActivate', () => {
    const guard = new JwtRefreshGuard();
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
});
