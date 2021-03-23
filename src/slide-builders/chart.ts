import { byMapKeyAsc } from '../utils/comparators';
import type { ChartData, ChartSlide, Period } from '../task1';
import type { Sprint, SprintId } from '../entities';

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
