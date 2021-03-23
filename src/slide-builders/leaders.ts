import type { LeadersData, LeadersSlide } from '../task1';
import type { Sprint } from '../entities';

export default function buildLeadersSlide(
  currentSprint: Sprint,
  commitLeaderboard: LeadersData['users'],
): LeadersSlide {
  return {
    alias: 'leaders',
    data: {
      title: 'Больше всего коммитов',
      subtitle: currentSprint.name,
      emoji: '👑',
      users: commitLeaderboard,
    }
  };
}
