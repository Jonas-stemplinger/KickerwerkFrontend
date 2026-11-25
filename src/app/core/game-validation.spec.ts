import { validateGameSelection } from './game-validation';

describe('validateGameSelection', () => {
  it('accepts a game with at least one player per team and a winner', () => {
    expect(validateGameSelection(['green-1', null], ['yellow-1', null], 'green')).toBeNull();
  });

  it('requires both teams and a selected winner', () => {
    expect(validateGameSelection(['green-1', null], [null, null], 'green')).toContain('pro Team');
    expect(validateGameSelection(['green-1', null], ['yellow-1', null], null)).toContain('Gewinnerteam');
  });

  it('rejects duplicate players across the teams', () => {
    expect(validateGameSelection(['same-player', null], ['same-player', null], 'yellow')).toContain('nur einmal');
  });
});
