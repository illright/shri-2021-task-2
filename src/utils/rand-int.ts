/** Generate a random integer between `lower` and `upper`, both ends included. */
import seedrandom from 'seedrandom';

const randomGenerator = seedrandom('Yandex.SHRI 2021');

export default function randInt(lower: number, upper: number) {
  return Math.floor(randomGenerator() * (upper - lower)) + lower;
}
