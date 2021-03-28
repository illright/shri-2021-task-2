import {
  bySprintStartTime,
  byMapKeyAsc,
  byMapValueDesc,
  relativeToSprint,
  RelativePosition,
} from '../../src/utils/comparators';
import randInt from '../../src/utils/rand-int';
import type { Sprint } from '../../src/entities';

test('The comparator of sprints by their start time works correctly', () => {
  const year = randInt(2000, 2050);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  const sprint1: Sprint = {
    type: 'Sprint',
    id: 0,
    name: 'test',
    startAt: (new Date(year, month, day)).valueOf(),
    finishAt: (new Date(year, month, day + 7)).valueOf(),
  };
  const sprint2: Sprint = {
    type: 'Sprint',
    id: 1,
    name: 'another',
    startAt: (new Date(year, month, day + 14)).valueOf(),
    finishAt: (new Date(year, month, day + 21)).valueOf(),
  };

  expect(bySprintStartTime(sprint1, sprint2)).toBeLessThan(0);
  expect(bySprintStartTime(sprint2, sprint1)).toBeGreaterThan(0);
  expect(bySprintStartTime(sprint2, sprint2)).toEqual(0);
});

test('The comparators of map entries work correctly', () => {
  const item1: [number, number] = [1, 2];
  const item2: [number, number] = [3, 1];
  expect(byMapKeyAsc(item1, item2)).toBeLessThan(0);
  expect(byMapKeyAsc(item2, item1)).toBeGreaterThan(0);
  expect(byMapKeyAsc(item2, item2)).toEqual(0);
  expect(byMapValueDesc(item1, item2)).toBeLessThan(0);
  expect(byMapValueDesc(item2, item1)).toBeGreaterThan(0);
  expect(byMapValueDesc(item2, item2)).toEqual(0);
})

test('The relative positioning of timestamps relative to sprints works correctly', () => {
  const year = randInt(2000, 2050);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  const sprint: Sprint = {
    type: 'Sprint',
    id: 0,
    name: 'test',
    startAt: (new Date(year, month, day)).valueOf(),
    finishAt: (new Date(year, month, day + 7)).valueOf(),
  };

  const before = new Date(year, month, day - 1).valueOf();
  const within = new Date(year, month, day + 2).valueOf();
  const after = new Date(year, month, day + 9).valueOf();

  expect(relativeToSprint(sprint, before)).toEqual(RelativePosition.Earlier);
  expect(relativeToSprint(sprint, within)).toEqual(RelativePosition.Within);
  expect(relativeToSprint(sprint, after)).toEqual(RelativePosition.Later);
});
