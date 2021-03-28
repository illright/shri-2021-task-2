import getID, { isEntity } from '../../src/utils/get-id';
import type {
  Comment,
  Commit,
  Issue,
  Project,
  Sprint,
  Summary,
  User,
} from '../../src/entities';

test('A Project can be told apart from its ID', () => {
  const project: Project = {
    id: '0',
    type: 'Project',
    name: 'Some Project',
    dependencies: [],
    issues: [],
    commits: [],
  };

  expect(isEntity(project)).toBeTruthy();
  expect(isEntity(project.id)).toBeFalsy()
  expect(getID(project)).toEqual(project.id);
  expect(getID(project.id)).toEqual(project.id);
});

test('A User can be told apart from their ID', () => {
  const user: User = {
    id: 0,
    type: 'User',
    name: 'some name',
    login: 'login',
    avatar: '0.png',
    friends: [],
  };

  expect(isEntity(user)).toBeTruthy();
  expect(isEntity(user.id)).toBeFalsy()
  expect(getID(user)).toEqual(user.id);
  expect(getID(user.id)).toEqual(user.id);
});

test('An Issue can be told apart from its ID', () => {
  const issue: Issue = {
      id: '0',
      type: 'Issue',
      name: 'some name',
      status: 'open',
      comments: [],
      createdAt: 0,
  };

  expect(isEntity(issue)).toBeTruthy();
  expect(isEntity(issue.id)).toBeFalsy()
  expect(getID(issue)).toEqual(issue.id);
  expect(getID(issue.id)).toEqual(issue.id);
});

test('A Commit can be told apart from its ID', () => {
  const commit: Commit = {
    id: '0',
    type: 'Commit',
    author: 0,
    message: 'hello',
    timestamp: 0,
    summaries: [],
  };

  expect(isEntity(commit)).toBeTruthy();
  expect(isEntity(commit.id)).toBeFalsy()
  expect(getID(commit)).toEqual(commit.id);
  expect(getID(commit.id)).toEqual(commit.id);
});

test('A Comment can be told apart from its ID', () => {
  const comment: Comment = {
    id: '0',
    type: 'Comment',
    author: 0,
    message: 'hello',
    createdAt: 0,
    likes: [],
  };

  expect(isEntity(comment)).toBeTruthy();
  expect(isEntity(comment.id)).toBeFalsy()
  expect(getID(comment)).toEqual(comment.id);
  expect(getID(comment.id)).toEqual(comment.id);
});

test('A Summary can be told apart from its ID', () => {
  const summary: Summary = {
    id: 0,
    type: 'Summary',
    path: '/hello.txt',
    added: 5,
    removed: 5,
  };

  expect(isEntity(summary)).toBeTruthy();
  expect(isEntity(summary.id)).toBeFalsy()
  expect(getID(summary)).toEqual(summary.id);
  expect(getID(summary.id)).toEqual(summary.id);
});

test('A Sprint can be told apart from its ID', () => {
  const sprint: Sprint = {
    id: 0,
    type: 'Sprint',
    name: 'some name',
    startAt: 0,
    finishAt: 1,
  };

  expect(isEntity(sprint)).toBeTruthy();
  expect(isEntity(sprint.id)).toBeFalsy()
  expect(getID(sprint)).toEqual(sprint.id);
  expect(getID(sprint.id)).toEqual(sprint.id);
});
