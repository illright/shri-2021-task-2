import { pluralize, entityPluralizations } from '../utils/pluralization';
import type { CommitSizes } from '../utils/data-structures';
import type { DiagramSlide } from '../task1';
import type { Sprint } from '../entities';

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
      differenceText: `${totalDifference > 0 ? '+' + totalDifference : totalDifference} с прошлого спринта`,
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
