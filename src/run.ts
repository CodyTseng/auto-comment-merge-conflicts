import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  addMergeConflictCommentIfNeed,
  deleteMergeConflictCommentIfNeed,
} from './comment';
import { MergeableState } from './enum';
import { GitHub, PullRequest } from './interface';
import { getAllUnlockedPRs } from './pull-request';
import { retry } from './utils';

export async function run() {
  const token = core.getInput('token', {
    required: true,
  });

  const waitMS = parseInt(core.getInput('wait-ms'));
  const maxRetries = parseInt(core.getInput('max-retries'));
  const commentBody = core.getInput('comment-body');
  core.debug(
    `waitMS=${waitMS}; maxRetries=${maxRetries}; commentBody=${commentBody}`,
  );

  const octokit = github.getOctokit(token);

  const prs = await retry(
    async () => getAllUnlockedPRs(octokit, github.context),
    waitMS,
    maxRetries,
  );

  core.info(`Found ${prs.length} unlocked PRs.`);

  await Promise.all(
    prs.map((pr) => updateMergeConflictComment(octokit, pr, commentBody)),
  );
}

async function updateMergeConflictComment(
  octokit: GitHub,
  pr: PullRequest,
  commentBody: string,
) {
  return pr.mergeable === MergeableState.Conflicting
    ? addMergeConflictCommentIfNeed(octokit, pr, commentBody)
    : deleteMergeConflictCommentIfNeed(octokit, pr, commentBody);
}
