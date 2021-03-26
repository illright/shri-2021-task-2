import fetch from 'node-fetch';
import { prepareData } from '../src/main';
import type { Entity } from '../src/entities';
import type { Slide } from '../src/task1';

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
