import faker from 'faker';
import randInt from './utils/rand-int';
import type { User, Sprint, Commit } from '../src/entities';

/**
 * Generate a list of `amount` users.
 * Their IDs will be numbered consecutively from 0.
 *
 * @param amount How many users to generate.
 * @return A list of users.
 */
export function users(amount: number) {
  const result: User[] = [];
  for (let i = 0; i < amount; ++i) {
    result.push({
      type: 'User',
      id: i,
      name: faker.name.findName(),
      login: faker.internet.userName(),
      avatar: `${i}.jpg`,
      friends: [],
    });
  }

  return result;
}

/**
 * Generate a list of `amount` sprints.
 * Their IDs will be numbered consecutively from `idOffset`.
 *
 * @param amount How many users to generate.
 * @param idOffset The ID of the first generated sprint.
 * @return A list of sprints.
 */
export function sprints(amount: number, idOffset: number) {
  const sprintDurationDays = 7;
  const result: Sprint[] = [];
  const startDate = new Date(randInt(2000, 2050), randInt(0, 11), randInt(0, 28));

  for (let i = idOffset; i < idOffset + amount; ++i) {
    result.push({
      type: 'Sprint',
      id: i,
      name: faker.company.bs(),
      startAt: Math.floor(startDate.valueOf()),
      finishAt: Math.floor(new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + sprintDurationDays,
        startDate.getHours(),
        startDate.getMinutes(),
        startDate.getSeconds() - 1,
      ).valueOf()),
    });
    startDate.setDate(startDate.getDate() + sprintDurationDays);
  }

  return result;
}

/**
 * Generate a list of commits distributed among sprints and users.
 * The distribution is specified as an array of arrays representing sprints.
 * Inside of those inner arrays are amounts of commits for each user.
 *
 * @param distribution An array of arrays for sprints with amounts of commits for users.
 * @param firstSprintStart The starting time of the first sprint.
 * @return A list of commits.
 */
export function commits(distribution: number[][], firstSprintStart: number) {
  const sprintDurationMs = 7 * 24 * 60 * 60 * 1000;
  const result: Commit[] = [];

  let commitID = randInt(0, 1000);
  for (let sprintIdx = 0; sprintIdx < distribution.length; ++sprintIdx) {
    for (let userIdx = 0; userIdx < distribution[sprintIdx].length; ++userIdx) {
      for (let _ = 0; _ < distribution[sprintIdx][userIdx]; ++_) {
        result.push({
          type: 'Commit',
          id: (commitID++).toString(),
          author: userIdx,
          message: faker.git.commitMessage(),
          summaries: [],
          timestamp: randInt(firstSprintStart, firstSprintStart + sprintDurationMs - 1),
        });
      }
    }
    firstSprintStart += sprintDurationMs;
  }

  return result;
}
