import { isEntity } from '../utils/get-id';
import type {
  Comment,
  Commit,
  Issue,
  Project,
  Summary,
  SummaryId,
  User,
  UserId,
} from '../entities';

function walkUser(
  user: User,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  for (const friend of user.friends) {
    if (isEntity(friend)) {
      users.set(friend.id, friend);
      walkUser(friend, users, commits, comments, summaries);
    }
  }
  const commitObjects = (user?.commits ?? []).filter(isEntity) as Commit[];
  commits.push(...commitObjects);
  commitObjects.forEach(x => walkCommit(x, users, commits, comments, summaries));
  const commentObjects = (user?.comments ?? []).filter(isEntity) as Comment[];
  comments.push(...commentObjects);
  commentObjects.forEach(x => walkComment(x, users, commits, comments, summaries));
}

function walkCommit(
  commit: Commit,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  if (isEntity(commit.author)) {
    users.set(commit.author.id, commit.author);
    walkUser(commit.author, users, commits, comments, summaries);
  }

  for (const summary of commit.summaries) {
    if (isEntity(summary)) {
      summaries.set(summary.id, summary);
      walkSummary(summary, users, commits, comments, summaries);
    }
  }
}

function walkComment(
  comment: Comment,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  if (isEntity(comment.author)) {
    walkUser(comment.author, users, commits, comments, summaries);
  }

  for (const user of comment.likes) {
    if (isEntity(user)) {
      users.set(user.id, user);
      walkUser(user, users, commits, comments, summaries);
    }
  }
}

function walkSummary(
  summary: Summary,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  const commentObjects = (summary?.comments ?? []).filter(isEntity) as Comment[];
  comments.push(...commentObjects);
  commentObjects.forEach(x => walkComment(x, users, commits, comments, summaries));
}

function walkProject(
  project: Project,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  for (const dependency of project.dependencies) {
    if (isEntity(dependency)) {
      walkProject(dependency, users, commits, comments, summaries);
    }
  }

  for (const issue of project.issues) {
    if (isEntity(issue)) {
      walkIssue(issue, users, commits, comments, summaries);
    }
  }

  const commitObjects = project.commits.filter(isEntity) as Commit[];
  commits.push(...commitObjects);
  commitObjects.forEach(x => walkCommit(x, users, commits, comments, summaries));
}

function walkIssue(
  issue: Issue,
  users: Map<UserId, User>,
  commits: Commit[],
  comments: Comment[],
  summaries: Map<SummaryId, Summary>,
) {
  const commentObjects = issue.comments.filter(isEntity) as Comment[];
  comments.push(...commentObjects);
  commentObjects.forEach(x => walkComment(x, users, commits, comments, summaries));

  if (isEntity(issue?.resolvedBy)) {
    users.set(issue.resolvedBy.id, issue.resolvedBy);
  }
}

export {
  walkUser as user,
  walkCommit as commit,
  walkComment as comment,
  walkSummary as summary,
  walkProject as project,
  walkIssue as issue,
}
