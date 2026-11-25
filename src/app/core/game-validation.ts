export function validateGameSelection(
  greenPlayerIds: readonly (string | null)[],
  yellowPlayerIds: readonly (string | null)[],
  winner: string | null,
): string | null {
  const green = greenPlayerIds.filter((id): id is string => id !== null);
  const yellow = yellowPlayerIds.filter((id): id is string => id !== null);

  if (!green.length || !yellow.length) {
    return 'Wähle mindestens einen Spieler pro Team aus.';
  }
  if (!winner) {
    return 'Wähle das Gewinnerteam aus.';
  }

  const selected = [...green, ...yellow];
  if (new Set(selected).size !== selected.length) {
    return 'Ein Spieler darf nur einmal pro Partie ausgewählt werden.';
  }

  return null;
}
