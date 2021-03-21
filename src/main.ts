import binarySearch from 'binary-search';
import Heap from 'heap-js';
import { pluralize, entityPluralizations } from './pluralization';
import type { Slide, Period, VoteSlide, LeadersSlide, ChartSlide, DiagramSlide } from './task1';
import type {
  Comment,
  Commit,
  Entity,
  Issue,
  Project,
  Sprint,
  SprintId,
  Summary,
  SummaryId,
  User,
  UserId,
} from './entities';


enum RelativePosition {
  Earlier = -1,
  Within = 0,
  Later = 1,
}

function relativeToSprint(sprint: Sprint, timestamp: number) {
  if (timestamp < sprint.startAt) {
    return RelativePosition.Earlier;
  }
  if (timestamp >= sprint.finishAt) {
    return RelativePosition.Later;
  }
  return RelativePosition.Within;
}

function withinSprint(timestamp: number, sprint: Sprint) {
  return relativeToSprint(sprint, timestamp) === RelativePosition.Within;
}

function getUserID(userOrID: User | UserId) {
  return typeof userOrID === 'number' ? userOrID : userOrID.id;
}

interface CommitSizes {
  upTo100: number;
  upTo500: number;
  upTo1000: number;
  moreThan1000: number;
}

function computeCommitSize(commit: Commit, summaries: Map<SummaryId, Summary>) {
  let result = 0;
  for (const summaryOrId of commit.summaries) {
    const summary = typeof summaryOrId === 'number' ? summaries.get(summaryOrId) : summaryOrId;
    result += summary.added + summary.removed;
  }
  return result;
}

function incrementSizeCounter(commitSize: number, counters: CommitSizes) {
  if (commitSize <= 100) {
    counters.upTo100++;
  } else if (commitSize <= 500) {
    counters.upTo500++;
  } else if (commitSize <= 1000) {
    counters.upTo1000++;
  } else {
    counters.moreThan1000++;
  }
}

function buildVoteSlide(
  sprintID: number,
  likesThisSprint: Map<UserId, number>,
  users: Map<UserId, User>,
): VoteSlide {
  return {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: `Спринт № ${sprintID}`,
      emoji: '🔎',
      users: [...likesThisSprint.entries()].map(([id, likeCount]) => {
        const user = users.get(id);
        return {
          id,
          name: user.name,
          avatar: user.avatar,
          valueText: pluralize(likeCount, entityPluralizations.votes),
        }
      }),
    },
  };
}

function buildLeadersSlide(
  sprintID: number,
  commitsPerUserThisSprint: Map<UserId, number>,
  users: Map<UserId, User>,
): LeadersSlide {
  return {
    alias: 'leaders',
    data: {
      title: 'Больше всего коммитов',
      subtitle: `Спринт № ${sprintID}`,
      emoji: '👑',
      users: [...commitsPerUserThisSprint.entries()].map(([id, commitCount]) => {
        const user = users.get(id);
        return {
          id,
          name: user.name,
          avatar: user.avatar,
          valueText: commitCount.toString(),
        }
      }),
    }
  };
}

function buildChartSlide(
  sprintID: number,
  commitsPerSprint: Map<SprintId, number>,
  commitsPerUserThisSprint: Map<UserId, number>,
  users: Map<UserId, User>,
): ChartSlide {
  const commitsHeap = new Heap((a: [number, number], b: [number, number]) => a[1] - b[1]);
  commitsHeap.push(...commitsPerUserThisSprint.entries());
  return {
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: `Спринт № ${sprintID}`,
      values: [...commitsPerSprint.entries()].map(([id, commitCount]) => {
        const period: Period = { title: id.toString(), value: commitCount };
        if (id === sprintID) {
          period.active = true;
        }
        return period;
      }),
      users: commitsHeap.top(3).map(([id, commitCount]) => {
        const user = users.get(id);
        return {
          id,
          name: user.name,
          avatar: user.avatar,
          valueText: commitCount.toString(),
        }
      }),
    }
  };
}

function buildDiagramSlide(
  sprintID: number,
  commitSizesThisSprint: CommitSizes,
  commitSizesLastSprint: CommitSizes,
): DiagramSlide {
  const totalCommitsThisSprint = (
    commitSizesThisSprint.upTo100
    + commitSizesThisSprint.upTo500
    + commitSizesThisSprint.upTo1000
    + commitSizesThisSprint.moreThan1000
  );
  const totalCommitsLastSprint = (
    commitSizesLastSprint.upTo100
    + commitSizesLastSprint.upTo500
    + commitSizesLastSprint.upTo1000
    + commitSizesLastSprint.moreThan1000
  );
  const totalDifference = totalCommitsThisSprint - totalCommitsLastSprint;
  const forceSign = true;
  const categories = [
    ['> 1001 строки', 'moreThan1000'],
    ['501 — 1000 строк', 'upTo1000'],
    ['501 — 1000 строк', 'upTo1000'],
    ['101 — 500 строк', 'upTo500'],
    ['1 — 100 строк', 'upTo100'],
  ];
  return {
    alias: 'diagram',
    data: {
      title: 'Размер коммитов',
      subtitle: `Спринт № ${sprintID}`,
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

export function prepareData(entities: Entity[], { sprintId }: { sprintId: number }): Slide[] {
  const users = new Map<UserId, User>();
  const projects: Project[] = [];
  const issues: Issue[] = [];
  const comments: Comment[] = [];
  const commits: Commit[] = [];
  const summaries = new Map<SummaryId, Summary>();
  const sprints: Sprint[] = [];

  let currentSprint: Sprint;
  let lastSprint: Sprint;

  for (const entity of entities) {
    if (entity.type === 'User') {
      users.set(entity.id, entity);
    } else if (entity.type === 'Project') {
      projects.push(entity);
    } else if (entity.type === 'Issue') {
      issues.push(entity);
    } else if (entity.type === 'Comment') {
      comments.push(entity);
    } else if (entity.type === 'Commit') {
      commits.push(entity);
    } else if (entity.type === 'Summary') {
      summaries.set(entity.id, entity);
    } else {
      if (entity.id === sprintId) {
        currentSprint = entity;
      }
      if (entity.id === sprintId - 1) {
        lastSprint = entity;
      }
      sprints.push(entity);
    }
  }

  sprints.sort((a, b) => a.startAt - b.startAt);

  const likesThisSprint = new Map<UserId, number>();
  for (const comment of comments) {
    if (withinSprint(comment.createdAt, currentSprint)) {
      const likeCount = comment.likes.length;
      const authorId = getUserID(comment.author);
      likesThisSprint.set(authorId, (likesThisSprint.get(authorId) ?? 0) + likeCount);
    }
  }

  const commitsPerUserThisSprint = new Map<UserId, number>();
  const commitsPerSprint = new Map<SprintId, number>();
  const commitSizesThisSprint: CommitSizes = {
    upTo100: 0,
    upTo500: 0,
    upTo1000: 0,
    moreThan1000: 0,
  };
  const commitSizesLastSprint: CommitSizes = {
    upTo100: 0,
    upTo500: 0,
    upTo1000: 0,
    moreThan1000: 0,
  };
  for (const commit of commits) {
    if (withinSprint(commit.timestamp, currentSprint)) {
      const authorId = getUserID(commit.author);
      commitsPerUserThisSprint.set(authorId, (commitsPerUserThisSprint.get(authorId) ?? 0) + 1);

      const commitSize = computeCommitSize(commit, summaries);
      incrementSizeCounter(commitSize, commitSizesThisSprint);
    }

    if (withinSprint(commit.timestamp, lastSprint)) {
      const commitSize = computeCommitSize(commit, summaries);
      incrementSizeCounter(commitSize, commitSizesLastSprint);
    }

    const sprintIndex = binarySearch(sprints, commit.timestamp, relativeToSprint);
    if (sprintIndex >= 0) {
      commitsPerSprint.set(
        sprints[sprintIndex].id,
        (commitsPerSprint.get(sprints[sprintIndex].id) ?? 0) + 1,
      );
    }
  }

  return [
    buildVoteSlide(
      sprintId,
      likesThisSprint,
      users,
    ),
    buildLeadersSlide(
      sprintId,
      commitsPerUserThisSprint,
      users,
    ),
    buildChartSlide(
      sprintId,
      commitsPerSprint,
      commitsPerUserThisSprint,
      users,
    ),
    buildDiagramSlide(
      sprintId,
      commitSizesThisSprint,
      commitSizesLastSprint,
    ),
  ];
}
