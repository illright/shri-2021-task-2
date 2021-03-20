import binarySearch from 'binary-search';
import { pluralize, entityPluralizations } from './pluralization';
import type { Slide, Period, VoteSlide, LeadersSlide, ChartSlide } from './task1';
import type {
  Comment,
  Commit,
  Entity,
  Issue,
  Project,
  Sprint,
  SprintId,
  Summary,
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


export function prepareData(entities: Entity[], { sprintId }: { sprintId: number }): Slide[] {
  const users = new Map<UserId, User>();
  const projects: Project[] = [];
  const issues: Issue[] = [];
  const comments: Comment[] = [];
  const commits: Commit[] = [];
  const summaries: Summary[] = [];
  const sprints: Sprint[] = [];

  let currentSprint: Sprint;

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
      summaries.push(entity);
    } else {
      if (entity.id === sprintId) {
        currentSprint = entity;
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

  const commitsThisSprint = new Map<UserId, number>();
  const commitsPerSprint = new Map<SprintId, number>();
  for (const commit of commits) {
    if (withinSprint(commit.timestamp, currentSprint)) {
      const authorId = getUserID(commit.author);
      commitsThisSprint.set(authorId, (commitsThisSprint.get(authorId) ?? 0) + 1);
    }

    const sprintIndex = binarySearch(sprints, commit.timestamp, relativeToSprint);
    if (sprintIndex >= 0) {
      commitsPerSprint.set(
        sprints[sprintIndex].id,
        (commitsPerSprint.get(sprints[sprintIndex].id) ?? 0) + 1,
      );
    }
  }

  const voteSlide: VoteSlide = {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: `Спринт № ${sprintId}`,
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

  const leadersSlide: LeadersSlide = {
    alias: 'leaders',
    data: {
      title: 'Больше всего коммитов',
      subtitle: 'Спринт № 213',
      emoji: '👑',
      users: [...commitsThisSprint.entries()].map(([id, commitCount]) => {
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

  const chartSlide: ChartSlide = {
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: 'Спринт № 213',
      values: [...commitsPerSprint.entries()].map(([id, commitCount]) => {
        const period: Period = { title: id.toString(), value: commitCount };
        if (id === sprintId) {
          period.active = true;
        }
        return period;
      }),
      users: [...commitsThisSprint.entries()].map(([id, commitCount]) => {
        // TODO: leave 3 best entries
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

  return [voteSlide, leadersSlide, chartSlide];
}
