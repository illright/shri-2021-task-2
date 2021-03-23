import type { Sprint } from '../entities';

export function bySprintStartTime(a: Sprint, b: Sprint) {
  return a.startAt - b.startAt;
}

export function byMapKeyAsc(a: [number, number], b: [number, number]) {
  return a[0] - b[0];
}

export function byMapValueDesc(a: [number, number], b: [number, number]) {
  return b[1] - a[1];
}

export enum RelativePosition {
  Later = -1,
  Within = 0,
  Earlier = 1,
}

export function relativeToSprint(sprint: Sprint, timestamp: number) {
  if (timestamp < sprint.startAt) {
    return RelativePosition.Earlier;
  }
  if (timestamp >= sprint.finishAt) {
    return RelativePosition.Later;
  }
  return RelativePosition.Within;
}
