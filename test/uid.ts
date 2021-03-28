let value = 0;

/** Return an ID that is guaranteed to be unique. */
export default function uid() {
  return value++;
}
