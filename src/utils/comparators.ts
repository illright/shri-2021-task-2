import type { Sprint } from '../entities';

/** A comparator for sprint objects ordering them by their starting time ascending. */
export function bySprintStartTime(a: Sprint, b: Sprint) {
  return a.startAt - b.startAt;
}

/** A comparator for [number: number] mapping entries by the first value ascending. */
export function byMapKeyAsc(a: [number, number], b: [number, number]) {
  return a[0] - b[0];
}

/** A comparator for [number: number] mapping entries by the second value descending. */
export function byMapValueDesc(a: [number, number], b: [number, number]) {
  return b[1] - a[1];
}

/** Positions of a timestamp relative to a sprint on the timeline. */
export enum RelativePosition {
  Later = -1,
  Within = 0,
  Earlier = 1,
}

/**
 * A comparator for timestamps to Sprint objects for binary search.
 *
 * @param sprint The sprint to position the timestamp relative to.
 * @param timestamp A timestamp to determine the relative position of.
 * @return The relative position of the timestamp to the given sprint.
 */
export function relativeToSprint(sprint: Sprint, timestamp: number) {
  if (timestamp < sprint.startAt) {
    return RelativePosition.Earlier;
  }
  if (timestamp >= sprint.finishAt) {
    return RelativePosition.Later;
  }
  return RelativePosition.Within;
}
