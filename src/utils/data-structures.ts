import getID from './get-id';
import type { Commit, Summary, SummaryId } from '../entities';

export class CommitSizes {
  upTo100: number;
  upTo500: number;
  upTo1000: number;
  moreThan1000: number;

  constructor() {
    this.upTo100 = 0;
    this.upTo500 = 0;
    this.upTo1000 = 0;
    this.moreThan1000 = 0;
  }

  countInCommit(commit: Commit, summaries: Map<SummaryId, Summary>) {
    let commitSize = 0;
    for (const summaryOrID of commit.summaries) {
      const summary = summaries.get(getID<Summary>(summaryOrID));
      commitSize += summary.added + summary.removed;
    }

    if (commitSize <= 100) {
      this.upTo100++;
    } else if (commitSize <= 500) {
      this.upTo500++;
    } else if (commitSize <= 1000) {
      this.upTo1000++;
    } else {
      this.moreThan1000++;
    }
  }

  getTotal() {
    return (
      this.upTo100
      + this.upTo500
      + this.upTo1000
      + this.moreThan1000
    );
  }
}
