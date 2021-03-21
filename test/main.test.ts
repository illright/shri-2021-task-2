import inputData from './data/input.json';
import outputData from './data/output.json';
import { prepareData } from '../src/main';
import type { Entity } from '../src/entities';

test('works', () => {
  const myOutput = prepareData(inputData as Entity[], { sprintId: 977 });
  expect(myOutput).toBe(outputData);
})
