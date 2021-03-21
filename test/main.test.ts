import inputData from './data/input.json';
import outputData from './data/output.json';
import { prepareData } from '../src/main';
import type { Entity } from '../src/entities';

test('the example input produces the example output', () => {
  const exampleSprint = 977;
  const myOutput = prepareData(inputData as Entity[], { sprintId: exampleSprint });
  expect(myOutput).toEqual(outputData);
})
