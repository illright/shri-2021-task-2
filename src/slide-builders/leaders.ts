import type { LeadersData, LeadersSlide } from '../task1';
import type { Sprint } from '../entities';

/**
 * Construct the data for the Leaders slide.
 *
 * @param currentSprint The data of the current sprint.
 * @param commitLeaderboard A list of sprint participants, ordered by the amount of commits descending.
 * @return The data for the Leaders slide.
 */
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
