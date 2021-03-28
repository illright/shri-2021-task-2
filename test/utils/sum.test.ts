import sum from '../../src/utils/sum';

test('Array sums are computed correctly', () => {
  expect(sum([1, 2, 3])).toEqual(6);
  expect(sum([-1, -2, 3])).toEqual(0);
  expect(sum([])).toEqual(0);
});
