export function parseWarcraftLogsUrl(input: string) {
  const trimmed = input.trim();

  const reportMatch = trimmed.match(/warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)/);
  if (!reportMatch) {
    throw new Error('Link inválido de Warcraft Logs');
  }

  const fightMatch = trimmed.match(/[?#&]fight=([a-zA-Z0-9]+)/);

  return {
    reportCode: reportMatch[1],
    fightId: fightMatch?.[1],
  };
}
