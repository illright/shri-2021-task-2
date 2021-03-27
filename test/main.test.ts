import fetch from 'node-fetch';
import randInt from './utils/rand-int';
import * as generate from './entity-generators';
import { prepareData } from '../src/main';
import type { Entity, User } from '../src/entities';
import type { Slide, TeamMember } from '../src/task1';

jest.setTimeout(10000);

const indices = {
  leaders: 0,
  vote: 1,
  chart: 2,
  diagram: 3,
  activity: 4,
};

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
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ];
  const userAmount = commitDistribution[0].length;
  const sprintAmount = commitDistribution.length;
  const currentSprintIdx = sprintAmount - 1;

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const commits = generate.commits(commitDistribution, sprints[0].startAt);
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
      users: commitDistribution[currentSprintIdx]
        .map((elem, idx) => [elem, idx])
        .filter(([elem, _idx]) => elem > 0)
        .sort((a, b) => b[0] - a[0])
        .map(([elem, idx]) => ({ valueText: elem.toString(), ...createTeamMember(users[idx]) })),
    }
  }

  const myOutput = prepareData(input, { sprintId: sprints[currentSprintIdx].id })[indices.leaders];
  expect(myOutput).toEqual(expectedOutput);
});
