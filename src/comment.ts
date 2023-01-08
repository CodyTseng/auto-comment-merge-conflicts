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

  await octokit.graphql(query, {
    subjectId: pr.id,
    body: commentBody,
  });

  core.info(`Added a merge conflict comment to #${pr.number} PR.`);
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

  await octokit.graphql(query, {
    id: mergeConflictComment.id,
  });

  core.info(`Deleted a conflict comment from #${pr.number} PR.`);
}
