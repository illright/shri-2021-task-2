/** Generate a random integer between `lower` and `upper`, both ends included. */
export default function randInt(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower)) + lower;
}
