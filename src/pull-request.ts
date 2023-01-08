import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { MergeableState } from './enum';
import { GitHub, PullRequest, RepositoryPullRequests } from './interface';

export async function getAllUnlockedPRs(octokit: GitHub, context: Context) {
  let cursor: string | undefined;
  let hasNextPage = true;

  const unlockedPRs: PullRequest[] = [];

  while (hasNextPage) {
    const repoPRs = await getRepositoryPullRequests(octokit, context, cursor);

    if (!repoPRs || !repoPRs.repository) {
      core.setFailed(`Failed to get PR list: ${JSON.stringify(repoPRs)}`);
      return [];
    }

    for (const pr of repoPRs.repository.pullRequests.nodes) {
      if (pr.mergeable === MergeableState.Unknown) {
        throw new Error(
          'There is a pull request with unknown mergeable status',
        );
      }
      if (!pr.locked) {
        unlockedPRs.push(pr);
      }
    }

    cursor = repoPRs.repository.pullRequests.pageInfo.endCursor;
    hasNextPage = repoPRs.repository.pullRequests.pageInfo.hasNextPage;
  }

  return unlockedPRs;
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
                id
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

  try {
    return octokit.graphql<RepositoryPullRequests>(query, {
      owner: context.repo.owner,
      repo: context.repo.repo,
      after: cursor,
    });
  } catch (err) {
    core.setFailed(err as Error);
  }
}
