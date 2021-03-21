import binarySearch from 'binary-search';
import { pluralize, entityPluralizations } from './pluralization';
import {
  byMapKeyAsc,
  byMapValueDesc,
  bySprintStartTime,
  relativeToSprint,
  RelativePosition,
} from './comparators';
import type {
  Activity,
  ActivitySlide,
  ChartData,
  ChartSlide,
  DiagramSlide,
  LeadersData,
  LeadersSlide,
  Period,
  Slide,
  VoteSlide,
} from './task1';
import type {
  Comment,
  Commit,
  Entity,
  Sprint,
  SprintId,
  Summary,
  SummaryId,
  User,
  UserId,
} from './entities';


function withinSprint(timestamp: number, sprint: Sprint) {
  return relativeToSprint(sprint, timestamp) === RelativePosition.Within;
}

function isEntity<T extends Entity>(arg: T | T['id']): arg is T {
  return typeof arg === 'object' && 'id' in arg && 'type' in arg;
}

function getID<T extends Entity>(entityOrID: T | T['id']): T['id'] {
  return isEntity(entityOrID) ? entityOrID.id : entityOrID;
}

class CommitSizes {
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

function buildVoteSlide(
  currentSprint: Sprint,
  likesThisSprint: Map<UserId, number>,
  users: Map<UserId, User>,
): VoteSlide {
  const usersRankedByLikes = [...likesThisSprint.entries()];
  usersRankedByLikes.sort(byMapValueDesc);
  return {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: currentSprint.name,
      emoji: '🔎',
      users: usersRankedByLikes.map(([id, likeCount]) => {
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

function buildChartSlide(
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

function buildDiagramSlide(
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

function buildActivitySlide(
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

export function prepareData(entities: Entity[], { sprintId }: { sprintId: number }): Slide[] {
  let currentSprint: Sprint;
  let lastSprint: Sprint;

  const users = new Map<UserId, User>();
  const comments: Comment[] = [];
  const commits: Commit[] = [];
  const summaries = new Map<SummaryId, Summary>();
  const sprints: Sprint[] = [];
  const sprintsByID = new Map<SprintId, Sprint>();

  for (const entity of entities) {
    if (entity.type === 'User') {
      users.set(entity.id, entity);
    } else if (entity.type === 'Comment') {
      comments.push(entity);
    } else if (entity.type === 'Commit') {
      commits.push(entity);
    } else if (entity.type === 'Summary') {
      summaries.set(entity.id, entity);
    } else if (entity.type === 'Sprint') {
      if (entity.id === sprintId) {
        currentSprint = entity;
      }
      if (entity.id === sprintId - 1) {
        lastSprint = entity;
      }
      sprints.push(entity);
      sprintsByID.set(entity.id, entity);
    }
  }

  sprints.sort(bySprintStartTime);

  const likesThisSprint = new Map<UserId, number>();
  for (const comment of comments) {
    if (withinSprint(comment.createdAt, currentSprint)) {
      const likeCount = comment.likes.length;
      const authorID = getID<User>(comment.author);
      likesThisSprint.set(authorID, (likesThisSprint.get(authorID) ?? 0) + likeCount);
    }
  }

  const commitsPerUserThisSprint = new Map<UserId, number>();
  const commitsPerSprint = new Map<SprintId, number>();
  const commitSizesThisSprint = new CommitSizes();
  const commitSizesLastSprint = new CommitSizes();
  const commitTimeGridThisSprint = (new Array(7)).fill(null).map(
    () => (new Array<number>(24)).fill(0) as Activity
  );
  for (const commit of commits) {
    if (withinSprint(commit.timestamp, currentSprint)) {
      const authorId = getID<User>(commit.author);
      commitsPerUserThisSprint.set(authorId, (commitsPerUserThisSprint.get(authorId) ?? 0) + 1);
      commitSizesThisSprint.countInCommit(commit, summaries);

      const commitDate = new Date(commit.timestamp);
      commitTimeGridThisSprint[commitDate.getUTCDay()][commitDate.getUTCHours()]++;
    }

    if (withinSprint(commit.timestamp, lastSprint)) {
      commitSizesLastSprint.countInCommit(commit, summaries);
    }

    const sprintIndex = binarySearch(sprints, commit.timestamp, relativeToSprint);
    if (sprintIndex >= 0) {
      commitsPerSprint.set(
        sprints[sprintIndex].id,
        (commitsPerSprint.get(sprints[sprintIndex].id) ?? 0) + 1,
      );
    }
  }

  const usersRankedByCommits = [...commitsPerUserThisSprint.entries()];
  usersRankedByCommits.sort(byMapValueDesc);
  const commitLeaderboard = usersRankedByCommits.map(([id, commitCount]) => {
    const user = users.get(id);
    return {
      id,
      name: user.name,
      avatar: user.avatar,
      valueText: commitCount.toString(),
    };
  });

  return [
    buildLeadersSlide(
      currentSprint,
      commitLeaderboard,
    ),
    buildVoteSlide(
      currentSprint,
      likesThisSprint,
      users,
    ),
    buildChartSlide(
      currentSprint,
      sprints,
      commitsPerSprint,
      commitLeaderboard,
    ),
    buildDiagramSlide(
      currentSprint,
      commitSizesThisSprint,
      commitSizesLastSprint,
    ),
    buildActivitySlide(
      currentSprint,
      commitTimeGridThisSprint,
    ),
  ];
}
