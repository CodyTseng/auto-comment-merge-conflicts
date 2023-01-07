import * as core from '@actions/core';
import * as github from '@actions/github';
import { addMergeConflictComment } from './comment';
import { getAllUnlockedConflictingPRs, needComment } from './pull-request';
import { retry } from './utils';

async function run() {
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
    async () => getAllUnlockedConflictingPRs(octokit, github.context),
    waitMS,
    maxRetries,
  );

  const needCommentPRs = prs.filter(needComment(commentBody));

  if (needCommentPRs.length > 0) {
    await Promise.all(
      needCommentPRs.map((pr) =>
        addMergeConflictComment(octokit, pr.id, commentBody),
      ),
    );
  }
}

run();
