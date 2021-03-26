import { byMapKeyAsc } from '../utils/comparators';
import type { ChartData, ChartSlide, Period } from '../task1';
import type { Sprint, SprintId } from '../entities';

/**
 * Construct the data for the Chart slide.
 *
 * @param currentSprint The data of the current sprint.
 * @param allSprints A list of all sprints.
 * @param commitsPerSprint A mapping of a sprint ID to the amount of commits made during that sprint.
 * @param commitLeaderboard A list of sprint participants, ordered by the amount of commits descending.
 * @return The data for the Chart slide.
 */
export default function buildChartSlide(
  currentSprint: Sprint,
  allSprints: Sprint[],
  commitsPerSprint: Map<SprintId, number>,
  commitLeaderboard: ChartData['users'],
): ChartSlide {
  const sprintsOrdered = [...commitsPerSprint.entries()];
  sprintsOrdered.sort(byMapKeyAsc);
  return {
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: currentSprint.name,
      values: allSprints.map(sprint => {
        const period: Period = {
          title: sprint.id.toString(),
          value: commitsPerSprint.get(sprint.id) ?? 0,
          hint: sprint.name,
        };
        if (sprint.id === currentSprint.id) {
          period.active = true;
        }
        return period;
      }),
      users: commitLeaderboard,
    }
  };
}
