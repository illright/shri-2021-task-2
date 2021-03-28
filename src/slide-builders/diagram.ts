import { pluralize, entityPluralizations } from '../utils/pluralization';
import type CommitSizes from '../utils/commit-sizes';
import type { DiagramSlide } from '../task1';
import type { Sprint } from '../entities';

/**
 * Construct the data for the Diagram slide.
 *
 * @param currentSprint The data of the current sprint.
 * @param commitSizesThisSprint A counter for commits of different sizes made during this sprint.
 * @param commitSizesLastSprint A counter for commits of different sizes made during the last sprint.
 * @return The data for the Diagram slide.
 */
export default function buildDiagramSlide(
  currentSprint: Sprint,
  commitSizesThisSprint: CommitSizes,
  commitSizesLastSprint: CommitSizes,
): DiagramSlide {
  const totalCommitsThisSprint = commitSizesThisSprint.getTotal();
  const totalCommitsLastSprint = commitSizesLastSprint.getTotal();
  const totalDifference = totalCommitsThisSprint - totalCommitsLastSprint;
  const forceSign = true;
  const categories = [
    ['> 1001 строки', 'moreThan1000'],
    ['501 — 1000 строк', 'upTo1000'],
    ['101 — 500 строк', 'upTo500'],
    ['1 — 100 строк', 'upTo100'],
  ];
  return {
    alias: 'diagram',
    data: {
      title: 'Размер коммитов',
      subtitle: currentSprint.name,
      totalText: pluralize(totalCommitsThisSprint, entityPluralizations.commits),
      differenceText: pluralize(totalDifference, entityPluralizations.fromLastSprint, forceSign),
      categories: categories.map(([title, field]) => ({
        title,
        valueText: pluralize(commitSizesThisSprint[field], entityPluralizations.commits),
        differenceText: pluralize(
          commitSizesThisSprint[field] - commitSizesLastSprint[field],
          entityPluralizations.commits,
          forceSign,
        ),
      })),
    },
  };
}
