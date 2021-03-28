/** Computes a sum of the numbers in an array. */
export default function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}
