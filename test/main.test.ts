import fetch from 'node-fetch';
import randInt from './utils/rand-int';
import * as generate from './entity-generators';
import { prepareData } from '../src/main';
import { pluralize, entityPluralizations } from '../src/utils/pluralization';
import type { Entity, User } from '../src/entities';
import type { Slide, TeamMember, LeadersSlide, VoteSlide, ChartSlide } from '../src/task1';

jest.setTimeout(10000);

const indices = {
  leaders: 0,
  vote: 1,
  chart: 2,
  diagram: 3,
  activity: 4,
};

function createTeamMember(user: User): Omit<TeamMember, 'valueText'> {
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

test('The Leaders and Chart slides are constructed correctly', () => {
  const commitDistribution = [
    [0, 1, 2, 0, 3],
    [1, 1, 4, 0, 1],
    [22, 2, 11, 0, 5],
  ];
  const userAmount = commitDistribution[0].length;
  const sprintAmount = commitDistribution.length;
  const currentSprintIdx = sprintAmount - 1;

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const commits = generate.commitsInQuantity(commitDistribution, sprints[0].startAt);
  const input: Entity[] = [
    ...users,
    ...sprints,
    ...commits,
  ];

  const expectedLeaders: LeadersSlide = {
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

  const expectedChart: ChartSlide = {
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: sprints[currentSprintIdx].name,
      users: expectedLeaders.data.users,
      values: commitDistribution.map((sprint, idx) => ({
        title: sprints[idx].id.toString(),
        value: sprint.reduce((acc, elem) => acc + elem, 0),
        hint: sprints[idx].name,
        ...(idx === currentSprintIdx ? { active: true } : {}),
      })),
    }
  };

  const slides = prepareData(input, { sprintId: sprints[currentSprintIdx].id });
  const myLeaders = slides[indices.leaders];
  const myChart = slides[indices.chart];
  expect(myLeaders).toEqual(expectedLeaders);
  expect(myChart).toEqual(expectedChart);
});

test('The Vote slide is constructed correctly', () => {
  const likesDistribution = [
    [0, 1, 2, 0, 3],
    [1, 1, 4, 0, 1],
    [22, 2, 11, 0, 5],
  ];
  const userAmount = likesDistribution[0].length;
  const sprintAmount = likesDistribution.length;
  const currentSprintIdx = sprintAmount - 1;

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const comments = generate.commentsOfRating(likesDistribution, sprints[0].startAt);
  const input: Entity[] = [
    ...users,
    ...sprints,
    ...comments,
  ];

  const expectedOutput: VoteSlide = {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: sprints[currentSprintIdx].name,
      emoji: '🔎',
      users: likesDistribution[currentSprintIdx]
        .map((elem, idx) => [elem, idx])
        .filter(([elem, _idx]) => elem > 0)
        .sort((a, b) => b[0] - a[0])
        .map(([elem, idx]) => ({
          valueText: pluralize(elem, entityPluralizations.votes),
          ...createTeamMember(users[idx])
        })),
    }
  }

  const myOutput = prepareData(input, { sprintId: sprints[currentSprintIdx].id })[indices.vote];
  expect(myOutput).toEqual(expectedOutput);
});
