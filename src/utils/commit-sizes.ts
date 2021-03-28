import getID from './get-id';
import type { Commit, Summary, SummaryId } from '../entities';

/** A counter for commits of different sizes. */
export default class CommitSizes {
  /** The amount of commits from 1 to 100 lines in size. */
  upTo100: number;
  /** The amount of commits from 101 to 500 lines in size. */
  upTo500: number;
  /** The amount of commits from 501 to 1000 lines in size. */
  upTo1000: number;
  /** The amount of commits of 1001+ lines in size. */
  moreThan1000: number;

  constructor() {
    this.upTo100 = 0;
    this.upTo500 = 0;
    this.upTo1000 = 0;
    this.moreThan1000 = 0;
  }

  /**
   * Add a commit to the counter.
   *
   * @param commit The commit object to count in.
   * @param summaries The mapping of summary IDs to their data, used for computing the size of the commit.
   */
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

  /** Count the total amount of commits. */
  getTotal() {
    return (
      this.upTo100
      + this.upTo500
      + this.upTo1000
      + this.moreThan1000
    );
  }
}
