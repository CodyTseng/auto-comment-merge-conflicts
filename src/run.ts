import * as core from '@actions/core';
import * as github from '@actions/github';
import { CommentService } from './comment';
import { MergeableState } from './enum';
import { PullRequestService } from './pull-request';
import { QueryService } from './query';
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
  const { owner, repo } = github.context.repo;

  const queryService = new QueryService(octokit);
  const pullRequestService = new PullRequestService(queryService, owner, repo);
  const commentService = new CommentService(queryService, commentBody);

  const prs = await retry(
    async () => pullRequestService.getAllUnlockedPRs(),
    waitMS,
    maxRetries,
  );

  core.info(`Found ${prs.length} unlocked PRs.`);

  await Promise.all(
    prs.map((pr) =>
      pr.mergeable === MergeableState.Conflicting
        ? commentService.addMergeConflictCommentIfNeed(pr)
        : commentService.deleteMergeConflictCommentIfNeed(pr),
    ),
  );
}
