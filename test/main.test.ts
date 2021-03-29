import fetch from 'node-fetch';
import randInt from '../src/utils/rand-int';
import * as generate from './entity-generators';
import { prepareData } from '../src/main';
import { pluralize, entityPluralizations } from '../src/utils/pluralization';
import sum from '../src/utils/sum';
import type { Entity, User } from '../src/entities';
import type {
  ActivitySlide,
  ChartSlide,
  DiagramSlide,
  LeadersSlide,
  Slide,
  TeamMember,
  VoteSlide,
} from '../src/task1';

jest.setTimeout(15000);

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

test.skip('The example input produces the example output', async () => {
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
  const userAmount = randInt(5, 10);
  const sprintAmount = randInt(3, 10);
  const currentSprintIdx = randInt(1, sprintAmount - 1);
  const commitDistributionPerUser = new Array(sprintAmount).fill(null).map(
    () => new Array(userAmount).fill(null).map(() => randInt(0, 25))
  );

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const commits = generate.commitsInQuantity(commitDistributionPerUser, sprints[0].startAt);
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
      users: commitDistributionPerUser[currentSprintIdx]
        .map((elem, idx) => [elem, idx])
        .filter(([elem, _idx]) => elem > 0)
        .sort((a, b) => a[1] - b[1])
        .map(([elem, idx]) => ({ valueText: elem.toString(), ...createTeamMember(users[idx]) })),
    }
  }

  const expectedChart: ChartSlide = {
    alias: 'chart',
    data: {
      title: 'Коммиты',
      subtitle: sprints[currentSprintIdx].name,
      users: expectedLeaders.data.users,
      values: commitDistributionPerUser.map((sprint, idx) => ({
        title: sprints[idx].id.toString(),
        value: sum(sprint),
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
  const userAmount = randInt(5, 10);
  const sprintAmount = randInt(3, 10);
  const currentSprintIdx = randInt(1, sprintAmount - 1);
  const likesDistributionPerUser = new Array(sprintAmount).fill(null).map(
    () => new Array(userAmount).fill(null).map(() => randInt(0, 25))
  );

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const comments = generate.commentsOfRating(likesDistributionPerUser, sprints[0].startAt);
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
      users: likesDistributionPerUser[currentSprintIdx]
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

test('The Diagram slide is constructed correctly', () => {
  const userAmount = randInt(5, 10);
  const sprintAmount = randInt(3, 10);
  const currentSprintIdx = randInt(1, sprintAmount - 1);
  const categories = [
    '> 1001 строки',
    '501 — 1000 строк',
    '101 — 500 строк',
    '1 — 100 строк',
  ];
  const commitSizesDistributionPerSprint = new Array(sprintAmount).fill(null).map(
    () => new Array(categories.length).fill(null).map(() => randInt(0, 100))
  );

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const commits = generate.commitsOfSizes(
    commitSizesDistributionPerSprint,
    sprints[0].startAt,
    userAmount,
  );
  const input: Entity[] = [
    ...users,
    ...sprints,
    ...commits,
  ];

  const totalThisSprint = sum(commitSizesDistributionPerSprint[currentSprintIdx]);
  const totalLastSprint = sum(commitSizesDistributionPerSprint[currentSprintIdx - 1]);
  const forceSign = true;
  const expectedOutput: DiagramSlide = {
    alias: 'diagram',
    data: {
      title: 'Размер коммитов',
      subtitle: sprints[currentSprintIdx].name,
      totalText: pluralize(totalThisSprint, entityPluralizations.commits),
      differenceText: pluralize(
        totalThisSprint - totalLastSprint,
        entityPluralizations.fromLastSprint,
        forceSign,
      ),
      categories: categories.map((elem, idx) => ({
        title: elem,
        valueText: pluralize(
          commitSizesDistributionPerSprint[currentSprintIdx][idx],
          entityPluralizations.commits,
        ),
        differenceText: pluralize(
          commitSizesDistributionPerSprint[currentSprintIdx][idx]
          - commitSizesDistributionPerSprint[currentSprintIdx - 1][idx],
          entityPluralizations.commits,
          forceSign,
        ),
      }))
    }
  }

  const myOutput = prepareData(input, { sprintId: sprints[currentSprintIdx].id })[indices.diagram];
  expect(myOutput).toEqual(expectedOutput);
});

test('The Activity slide is constructed correctly', () => {
  const userAmount = randInt(5, 10);
  const sprintAmount = randInt(3, 10);
  const currentSprintIdx = randInt(1, sprintAmount - 1);
  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const commitDistributionPerHour = new Array(sprintAmount).fill(null).map(
    () => weekdays.map(() => new Array(24).fill(null).map(() => randInt(0, 5)))
  );

  const users = generate.users(userAmount);
  const sprints = generate.sprints(sprintAmount, randInt(0, 1000));
  const commits = generate.commitsAtTime(commitDistributionPerHour, sprints[0].startAt, userAmount);
  const input: Entity[] = [
    ...users,
    ...sprints,
    ...commits,
  ];

  const expectedOutput: ActivitySlide = {
    alias: 'activity',
    data: {
      title: 'Коммиты',
      subtitle: sprints[currentSprintIdx].name,
      data: Object.fromEntries(
        weekdays.map((key, idx) => [key, commitDistributionPerHour[currentSprintIdx][idx]])
      ) as ActivitySlide['data']['data'],
    }
  }

  const myOutput = prepareData(input, { sprintId: sprints[currentSprintIdx].id })[indices.activity];
  expect(myOutput).toEqual(expectedOutput);
});
