import * as walk from '../../src/utils/walkers';
import type {
  Comment,
  Commit,
  Issue,
  Project,
  Summary,
  SummaryId,
  User,
  UserId,
} from '../../src/entities';

test('All recursive fields of User are walked', () => {
  const user: User = {
    id: 0,
    type: 'User',
    name: 'some name',
    login: 'login',
    avatar: '0.png',
    friends: [
      {
        id: 1,
        type: 'User',
        name: 'other name',
        login: 'login',
        avatar: '0.png',
        friends: [
          {
            id: 2,
            type: 'User',
            name: 'more name',
            login: 'login',
            avatar: '0.png',
            friends: [],
          },
        ],
      },
      5,
    ],
    commits: [
      {
        id: '0',
        type: 'Commit',
        author: 0,
        message: 'hello',
        timestamp: 0,
        summaries: [
          {
            id: 0,
            type: 'Summary',
            path: '/hello.txt',
            added: 5,
            removed: 5,
          }
        ],
      },
      '1',
    ],
    comments: [
      {
        id: '0',
        type: 'Comment',
        author: 0,
        message: 'hello',
        createdAt: 0,
        likes: [
          {
            id: 3,
            type: 'User',
            name: 'yay name',
            login: 'login',
            avatar: '0.png',
            friends: [],
          },
        ],
      },
      '1',
    ],
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.user(user, users, commits, comments, summaries);

  expect(users.size).toEqual(3);
  expect([1, 2, 3].every(x => users.has(x))).toBeTruthy();
  expect(users.get(1)).toBe(user.friends[0]);
  expect(commits).toHaveLength(1);
  expect(commits[0]).toBe(user.commits[0]);
  expect(comments).toHaveLength(1);
  expect(comments[0]).toBe(user.comments[0]);
  expect(summaries.size).toEqual(1);
  expect(summaries.get(0)).toBe((user.commits[0] as Commit).summaries[0]);
});

test('All recursive fields of Commit are walked', () => {
  const commit: Commit = {
    id: '0',
    type: 'Commit',
    author: {
      id: 0,
      type: 'User',
      name: 'some name',
      login: 'login',
      avatar: '0.png',
      friends: [],
      commits: [
        {
          id: '1',
          type: 'Commit',
          author: 0,
          message: 'hello',
          timestamp: 0,
          summaries: [],
        },
      ],
    },
    message: 'hello',
    timestamp: 0,
    summaries: [
      {
        id: 0,
        type: 'Summary',
        path: '/hello.txt',
        added: 5,
        removed: 5,
        comments: [
          {
            id: '0',
            type: 'Comment',
            author: 0,
            message: 'hello',
            createdAt: 0,
            likes: [],
          },
        ]
      },
      1
    ],
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.commit(commit, users, commits, comments, summaries);

  expect(users.size).toEqual(1);
  expect(users.get(0)).toBe(commit.author);
  expect(commits).toHaveLength(1);
  expect(commits[0]).toBe((commit.author as User).commits[0]);
  expect(comments).toHaveLength(1);
  expect(comments[0]).toBe((commit.summaries[0] as Summary).comments[0]);
  expect(summaries.size).toEqual(1);
  expect(summaries.get(0)).toBe(commit.summaries[0]);
});

test('All recursive fields of Comment are walked', () => {
  const comment: Comment = {
    id: '0',
    type: 'Comment',
    author: {
      id: 0,
      type: 'User',
      name: 'some name',
      login: 'login',
      avatar: '0.png',
      friends: [],
      commits: [
        {
          id: '1',
          type: 'Commit',
          author: 0,
          message: 'hello',
          timestamp: 0,
          summaries: [],
        },
      ],
    },
    message: 'hello',
    createdAt: 0,
    likes: [
      {
        id: 1,
        type: 'User',
        name: 'other name',
        login: 'login',
        avatar: '0.png',
        friends: [
          {
            id: 2,
            type: 'User',
            name: 'more name',
            login: 'login',
            avatar: '0.png',
            friends: [],
          },
        ],
      },
      5,
    ],
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.comment(comment, users, commits, comments, summaries);

  expect(users.size).toEqual(3);
  expect([0, 1, 2].every(x => users.has(x))).toBeTruthy();
  expect(users.get(0)).toBe(comment.author);
  expect(commits).toHaveLength(1);
  expect(commits[0]).toBe((comment.author as User).commits[0]);
  expect(comments).toHaveLength(0);
  expect(summaries.size).toEqual(0);
});

test('All recursive fields of Summary are walked', () => {
  const summary: Summary = {
    id: 0,
    type: 'Summary',
    path: '/hello.txt',
    added: 5,
    removed: 5,
    comments: [{
      id: '0',
      type: 'Comment',
      author: {
        id: 0,
        type: 'User',
        name: 'some name',
        login: 'login',
        avatar: '0.png',
        friends: [],
        commits: [],
      },
      message: 'hello',
      createdAt: 0,
      likes: [],
    }],
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.summary(summary, users, commits, comments, summaries);

  expect(users.size).toEqual(1);
  expect(users.get(0)).toBe((summary.comments[0] as Comment).author);
  expect(commits).toHaveLength(0);
  expect(comments).toHaveLength(1);
  expect(comments[0]).toBe(summary.comments[0]);
  expect(summaries.size).toEqual(0);
});

test('All recursive fields of Project are walked', () => {
  const project: Project = {
    id: '0',
    type: 'Project',
    name: 'Some Project',
    dependencies: [
      {
        id: '1',
        type: 'Project',
        name: 'Other Project',
        dependencies: [],
        issues: [],
        commits: [
          {
            id: '1',
            type: 'Commit',
            author: 4,
            message: 'hello',
            timestamp: 0,
            summaries: [],
          },
        ],
      },
      '4',
    ],
    issues: [
      {
        id: '0',
        type: 'Issue',
        name: 'some name',
        status: 'closed',
        resolvedBy: {
          id: 0,
          type: 'User',
          name: 'some name',
          login: 'login',
          avatar: '0.png',
          friends: [],
          commits: [],
          comments: [],
        },
        comments: [],
        createdAt: 0,
      },
      '1',
    ],
    commits: [
      {
        id: '0',
        type: 'Commit',
        author: {
          id: 1,
          type: 'User',
          name: 'other name',
          login: 'login',
          avatar: '0.png',
          friends: [],
          commits: [],
        },
        message: 'hello',
        timestamp: 0,
        summaries: [],
      },
      '2',
    ],
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.project(project, users, commits, comments, summaries);

  expect(users.size).toEqual(2);
  expect([0, 1].every(x => users.has(x))).toBeTruthy();
  expect(users.get(0)).toBe((project.issues[0] as Issue).resolvedBy);
  expect(commits).toHaveLength(2);
  expect(commits[1]).toBe(project.commits[0]);
  expect(comments).toHaveLength(0);
  expect(summaries.size).toEqual(0);
});

test('All recursive fields of Issue are walked', () => {
  const issue: Issue = {
    id: '0',
    type: 'Issue',
    name: 'some name',
    status: 'closed',
    resolvedBy: {
      id: 0,
      type: 'User',
      name: 'some name',
      login: 'login',
      avatar: '0.png',
      friends: [],
      commits: [
        {
          id: '0',
          type: 'Commit',
          author: 7,
          message: 'hello',
          timestamp: 0,
          summaries: [],
        },
      ],
      comments: [],
    },
    comments: [
      {
        id: '0',
        type: 'Comment',
        author: {
          id: 1,
          type: 'User',
          name: 'other name',
          login: 'login',
          avatar: '0.png',
          friends: [],
          commits: [],
        },
        message: 'hello',
        createdAt: 0,
        likes: [],
      },
      '1',
    ],
    createdAt: 0,
  };

  const users = new Map<UserId, User>();
  const commits: Commit[] = [];
  const comments: Comment[] = [];
  const summaries = new Map<SummaryId, Summary>();
  walk.issue(issue, users, commits, comments, summaries);

  expect(users.size).toEqual(2);
  expect([0, 1].every(x => users.has(x))).toBeTruthy();
  expect(users.get(0)).toBe(issue.resolvedBy);
  expect(commits).toHaveLength(1);
  expect(commits[0]).toBe((issue.resolvedBy as User).commits[0]);
  expect(comments).toHaveLength(1);
  expect(comments[0]).toBe(issue.comments[0]);
  expect(summaries.size).toEqual(0);
});
