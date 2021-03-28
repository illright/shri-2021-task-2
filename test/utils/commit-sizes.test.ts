import { summariesOfSize } from '../entity-generators';
import CommitSizes from '../../src/utils/commit-sizes';
import randInt from '../../src/utils/rand-int';
import sum from '../../src/utils/sum';
import type { SummaryId, Summary } from '../../src/entities';

test('Commits are grouped by size correctly', () => {
  const sizeBounds: ([number, number])[] = [
    [1001, 10000],
    [501, 1000],
    [101, 500],
    [1, 100],
  ];
  const commitSizes = new CommitSizes();
  expect(commitSizes.getTotal()).toEqual(0);

  const summaries = new Map<SummaryId, Summary>();
  const amountsInCategory = new Array(sizeBounds.length).fill(null).map(() => randInt(0, 15));
  for (let categoryIdx = 0; categoryIdx < sizeBounds.length; ++categoryIdx) {
    for (let _ = 0; _ < amountsInCategory[categoryIdx]; ++_) {
      const commitSummaries = summariesOfSize(randInt(...sizeBounds[categoryIdx]));
      commitSummaries.forEach(summary => summaries.set(summary.id, summary));
      commitSizes.countInCommit({
        type: 'Commit',
        author: 0,
        id: '0',
        message: '',
        summaries: commitSummaries,
        timestamp: 0,
      }, summaries);
    }
  }

  expect(commitSizes.moreThan1000).toEqual(amountsInCategory[0]);
  expect(commitSizes.upTo1000).toEqual(amountsInCategory[1]);
  expect(commitSizes.upTo500).toEqual(amountsInCategory[2]);
  expect(commitSizes.upTo100).toEqual(amountsInCategory[3]);
  expect(commitSizes.getTotal()).toEqual(sum(amountsInCategory));
});
