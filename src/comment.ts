import * as core from '@actions/core';
import { GitHub, PullRequest } from './interface';

export async function addMergeConflictCommentIfNeed(
  octokit: GitHub,
  pr: PullRequest,
  commentBody: string,
): Promise<void> {
  const mergeConflictComment = pr.comments.nodes.find(
    (comment) => comment.body === commentBody,
  );

  if (mergeConflictComment) return;

  const query = `mutation ($subjectId: ID!, $body: String!) {
    addComment(input: {
      subjectId: $subjectId
      body: $body
    }) {
      clientMutationId
    }
  }`;

  try {
    await octokit.graphql(query, {
      subjectId: pr.id,
      body: commentBody,
    });
  } catch (err) {
    core.setFailed(err as Error);
  }

  core.info(`Added a conflict comment to PR #${pr.number}`);
}

export async function deleteMergeConflictCommentIfNeed(
  octokit: GitHub,
  pr: PullRequest,
  commentBody: string,
): Promise<void> {
  const mergeConflictComment = pr.comments.nodes.find(
    (comment) => comment.body === commentBody,
  );

  if (!mergeConflictComment) return;

  const query = `mutation ($id: ID!) {
    deleteIssueComment(input: {
      id: $id
    }) {
      clientMutationId
    }
  }`;

  try {
    await octokit.graphql(query, {
      id: mergeConflictComment.id,
    });
  } catch (err) {
    core.setFailed(err as Error);
  }

  core.info(`Deleted a conflict comment from PR #${pr.number}`);
}
