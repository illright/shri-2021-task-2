import type { Activity, ActivitySlide } from '../task1';
import type { Sprint } from '../entities';

/**
 * Construct the data for the Activity slide.
 *
 * @param currentSprint The data of the current sprint.
 * @param commitTimeGrid An array of 7 arrays of 24 numbers, representing weekdays and hours.
 * @return The data for the Activity slide.
 */
export default function buildActivitySlide(
  currentSprint: Sprint,
  commitTimeGrid: Activity[],
): ActivitySlide {
  return {
    alias: 'activity',
    data: {
      title: 'Коммиты',
      subtitle: currentSprint.name,
      data: {
        mon: commitTimeGrid[1],
        tue: commitTimeGrid[2],
        wed: commitTimeGrid[3],
        thu: commitTimeGrid[4],
        fri: commitTimeGrid[5],
        sat: commitTimeGrid[6],
        sun: commitTimeGrid[0],
      }
    }
  }
}
