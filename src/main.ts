import binarySearch from 'binary-search';

import {
  byMapKeyAsc,
  byMapValueDesc,
  bySprintStartTime,
  relativeToSprint,
  RelativePosition,
} from './utils/comparators';
import getID from './utils/get-id';
import CommitSizes from './utils/commit-sizes';
import * as walk from './utils/walkers';
import {
  buildVoteSlide,
  buildLeadersSlide,
  buildChartSlide,
  buildDiagramSlide,
  buildActivitySlide,
} from './slide-builders';
import type { Activity, Slide } from './task1';
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


/** Determine whether a particular timestamp falls within the duration of a sprint. */
function withinSprint(timestamp: number, sprint: Sprint) {
  return relativeToSprint(sprint, timestamp) === RelativePosition.Within;
}

/**
 * Consume a stream of entities from the backend and process them to form slide data.
 *
 * @param entities The stream of entities.
 * @param currentSprint The data object containing the ID of the current sprint.
 * @param currentSprint.sprintId The sprint ID.
 * @return The data for 5 slides: Leaders, Vote, Chart, Diagram, Activity.
 */
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
      walk.user(entity, users, commits, comments, summaries);
    } else if (entity.type === 'Comment') {
      comments.push(entity);
      walk.comment(entity, users, commits, comments, summaries);
    } else if (entity.type === 'Commit') {
      commits.push(entity);
      walk.commit(entity, users, commits, comments, summaries);
    } else if (entity.type === 'Summary') {
      summaries.set(entity.id, entity);
      walk.summary(entity, users, commits, comments, summaries);
    } else if (entity.type === 'Sprint') {
      if (entity.id === sprintId) {
        currentSprint = entity;
      }
      if (entity.id === sprintId - 1) {
        lastSprint = entity;
      }
      sprints.push(entity);
      sprintsByID.set(entity.id, entity);
    } else if (entity.type === 'Project') {
      walk.project(entity, users, commits, comments, summaries)
    } else {
      walk.issue(entity, users, commits, comments, summaries);
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
  users.forEach(user => commitsPerUserThisSprint.set(user.id, 0));
  const commitsPerSprint = new Map<SprintId, number>();
  const commitSizesThisSprint = new CommitSizes();
  const commitSizesLastSprint = new CommitSizes();
  const commitTimeGridThisSprint = (new Array(7)).fill(null).map(
    () => (new Array<number>(24)).fill(0) as Activity
  );
  for (const commit of commits) {
    if (withinSprint(commit.timestamp, currentSprint)) {
      const authorId = getID<User>(commit.author);
      commitsPerUserThisSprint.set(authorId, commitsPerUserThisSprint.get(authorId) + 1);
      commitSizesThisSprint.countInCommit(commit, summaries);

      const commitDate = new Date(commit.timestamp);
      commitTimeGridThisSprint[commitDate.getDay()][commitDate.getHours()]++;
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
  usersRankedByCommits.sort((a, b) => byMapValueDesc(a, b) || byMapKeyAsc(a, b));
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
