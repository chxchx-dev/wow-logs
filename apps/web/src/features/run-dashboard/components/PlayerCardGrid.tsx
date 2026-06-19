import { useNavigate } from 'react-router-dom';
import type { PlayerMetricCardDto } from '@gpc/shared';
import { PlayerCard } from './PlayerCard';

interface PlayerCardGridProps {
  players: PlayerMetricCardDto[];
  reportCode: string;
}

export function PlayerCardGrid({ players, reportCode }: PlayerCardGridProps) {
  const navigate = useNavigate();

  if (players.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((player) => (
          <PlayerCard
            key={player.playerId}
            player={player}
            reportCode={reportCode}
            onSelect={() => navigate(`/player/${reportCode}/${player.playerId}`)}
          />
        ))}
      </div>
    </div>
  );
}
