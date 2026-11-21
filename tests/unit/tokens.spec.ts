import { SOLAROS_TOKENS } from '@solaros/config';

describe('Design Tokens Configuration', () => {
  it('should enforce exact Phase 0 color palette specification', () => {
    expect(SOLAROS_TOKENS.colors.primary).toBe('#2563EB');
    expect(SOLAROS_TOKENS.colors.success).toBe('#14B8A6');
    expect(SOLAROS_TOKENS.colors.analytics).toBe('#8B5CF6');
    expect(SOLAROS_TOKENS.colors.warning).toBe('#F59E0B');
    expect(SOLAROS_TOKENS.colors.danger).toBe('#F43F5E');
    expect(SOLAROS_TOKENS.colors.background).toBe('#F7F9FC');
    expect(SOLAROS_TOKENS.colors.surface).toBe('#FFFFFF');
  });
});
