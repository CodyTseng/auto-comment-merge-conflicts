import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { MergeableState } from './enum';
import { GitHub, RepositoryPullRequests, PullRequest } from './interface';

export async function getAllUnlockedConflictingPRs(
  octokit: GitHub,
  context: Context,
) {
  let cursor: string | undefined;
  let hasNextPage = true;

  const unlockedConflictingPRs: PullRequest[] = [];

  while (hasNextPage) {
    let repoPRs: RepositoryPullRequests | undefined;
    try {
      repoPRs = await getRepositoryPullRequests(octokit, context, cursor);
    } catch (err) {
      core.setFailed(`getRepositoryPullRequests failed: ${err}`);
    }

    if (!repoPRs || !repoPRs.repository) {
      core.setFailed(
        `getRepositoryPullRequests failed: ${JSON.stringify(repoPRs)}`,
      );
      return [];
    }

    for (const pr of repoPRs.repository.pullRequests.nodes) {
      if (pr.mergeable === MergeableState.Unknown) {
        throw new Error(
          'There is a pull request with unknown mergeable status',
        );
      }
      if (!pr.locked && pr.mergeable === MergeableState.Conflicting) {
        unlockedConflictingPRs.push(pr);
      }
    }

    cursor = repoPRs.repository.pullRequests.pageInfo.endCursor;
    hasNextPage = repoPRs.repository.pullRequests.pageInfo.hasNextPage;
  }

  return unlockedConflictingPRs;
}

async function getRepositoryPullRequests(
  octokit: GitHub,
  context: Context,
  cursor?: string,
) {
  const query = `query ($owner: String!, $repo: String!, $after: String) {
      repository(owner: $owner, name: $repo) {
        pullRequests(first: 100, states: OPEN, after: $after) {
          nodes {
            id
            number
            mergeable
            locked
            updatedAt
            comments(last: 100) {
              nodes {
                body
                createdAt
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`;

  return octokit.graphql<RepositoryPullRequests>(query, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    after: cursor,
  });
}

export function needComment(commentBody: string) {
  return (pr: PullRequest) =>
    !pr.comments.nodes.some((comment) => {
      if (comment.body !== commentBody) return false;
      const commentCreatedAt = Date.parse(comment.createdAt);
      const prUpdatedAt = Date.parse(pr.updatedAt);
      return commentCreatedAt >= prUpdatedAt;
    });
}
