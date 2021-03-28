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

/**
 * Recursively traverse and track all embedded objects inside of a User object.
 * Those are:
 *  - friends (User[])
 *  - commits (Commit[])
 *  - comments (Comment[])
 */
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

/**
 * Recursively traverse and track all embedded objects inside of a Commit object.
 * Those are:
 *  - author (User)
 *  - summaries (Summary[])
 *  - comments (Comment[])
 */
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

/**
 * Recursively traverse and track all embedded objects inside of a Comment object.
 * Those are:
 *  - author (User)
 *  - likes (User[])
 */
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

/**
 * Recursively traverse and track all embedded objects inside of a Summary object.
 * Those are:
 *  - comments (Comment[])
 */
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

/**
 * Recursively traverse and track all embedded objects inside of a Commit object.
 * Those are:
 *  - dependencies (Project[])
 *  - issues (Issue[])
 *  - commits (Commit[])
 */
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

/**
 * Recursively traverse and track all embedded objects inside of an Issue object.
 * Those are:
 *  - comments (Comment[])
 *  - resolvedBy (User)
 */
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
