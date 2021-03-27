import faker from 'faker';
import fetch from 'node-fetch';
import { prepareData } from '../src/main';
import type { Entity, User, Sprint, Commit } from '../src/entities';
import type { Slide, TeamMember } from '../src/task1';

/** Generate a random integer between `lower` and `upper`, both ends included. */
function randInt(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower)) + lower;
}

/**
 * Generate 
 */
function generateUsers(amount: number) {
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

function generateSprints(amount: number, idOffset: number) {
  const sprintDuration = 7;
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
        startDate.getDate() + sprintDuration,
      ).valueOf()),
    });
    startDate.setDate(startDate.getDate() + sprintDuration);
  }

  return result;
}

function generateCommits(distribution: number[][], sprints: Sprint[]) {
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
          timestamp: randInt(sprints[sprintIdx].startAt, sprints[sprintIdx].finishAt),
        });
      }
    }
  }

  return result;
}

function createTeamMember(user: User): Partial<TeamMember> {
  return { id: user.id, name: user.name, avatar: user.avatar };
}

test('The example input produces the example output', async () => {
  const exampleSprint = 977;
  const exampleDataBaseURL = 'https://raw.githubusercontent.com/yndx-shri/shri-2021-task-2/master/examples';
  const exampleInputURL = `${exampleDataBaseURL}/input.json`;
  const exampleOutputURL = `${exampleDataBaseURL}/output.json`;

  const inputData = await fetch(exampleInputURL).then(x => x.json()) as Entity[];
  const outputData = await fetch(exampleOutputURL).then(x => x.json()) as Slide[];

  const myOutput = prepareData(inputData, { sprintId: exampleSprint });
  expect(myOutput).toEqual(outputData);
});

test('The Leaders slide is constructed correctly', () => {
  const commitDistribution = [
    [0, 1, 2, 0, 3],
    [1, 1, 4, 0, 1],
    [22, 2, 11, 0, 5],
  ];
  const userAmount = commitDistribution[0].length;
  const sprintAmount = commitDistribution.length;
  const currentSprintIdx = sprintAmount - 1;

  const users = generateUsers(userAmount);
  const sprints = generateSprints(sprintAmount, randInt(0, 1000));
  const commits = generateCommits(commitDistribution, sprints);
  const input: Entity[] = [
    ...users,
    ...sprints,
    ...commits,
  ];

  const expectedOutput = {
    alias: 'leaders',
    data: {
      title: 'Больше всего коммитов',
      subtitle: sprints[currentSprintIdx].name,
      emoji: '👑',
      users: [
        { valueText: '22', ...createTeamMember(users[0]) },
        { valueText: '11', ...createTeamMember(users[2]) },
        { valueText: '5', ...createTeamMember(users[4]) },
        { valueText: '2', ...createTeamMember(users[1]) },
      ],
    }
  }

  const myOutput = prepareData(input, { sprintId: sprints[currentSprintIdx].id });
  expect(myOutput[0]).toEqual(expectedOutput);
});
