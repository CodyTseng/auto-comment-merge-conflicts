import * as core from '@actions/core';
import * as github from '@actions/github';
import { CommentService } from './comment';
import { MergeableState } from './enum';
import { PullRequest } from './interface';
import { LabelService } from './label';
import { PullRequestService } from './pull-request';
import { QueryService } from './query';
import { retry } from './utils';

export class Runner {
  private readonly waitMS: number;
  private readonly maxRetries: number;
  private readonly queryService: QueryService;
  private readonly pullRequestService: PullRequestService;
  private readonly commentService: CommentService;
  private readonly labelService: LabelService;

  constructor() {
    const token = core.getInput('token', {
      required: true,
    });

    this.waitMS = parseInt(core.getInput('wait-ms'));
    this.maxRetries = parseInt(core.getInput('max-retries'));

    const commentBody = core.getInput('comment-body');
    const labelName = core.getInput('label-name') || undefined;
    core.debug(
      `waitMS=${this.waitMS}; maxRetries=${this.maxRetries}; commentBody=${commentBody}`,
    );

    const octokit = github.getOctokit(token);

    this.queryService = new QueryService(octokit, github.context);
    this.pullRequestService = new PullRequestService(this.queryService);
    this.commentService = new CommentService(this.queryService, commentBody);
    this.labelService = new LabelService(this.queryService, labelName);
  }

  async init() {
    await this.labelService.init();
  }

  async run() {
    const prs = await retry(
      async () => this.pullRequestService.getAllUnlockedPRs(),
      this.waitMS,
      this.maxRetries,
    );

    core.info(`Found ${prs.length} unlocked PRs.`);

    await Promise.all(
      prs.map((pr) =>
        pr.mergeable === MergeableState.Conflicting
          ? this.addMergeConflictIfNeed(pr)
          : this.removeMergeConflictIfNeed(pr),
      ),
    );
  }

  private async addMergeConflictIfNeed(pr: PullRequest) {
    await Promise.all([
      this.commentService.addMergeConflictCommentIfNeed(pr),
      this.labelService.addMergeConflictLabelIfNeed(pr),
    ]);
  }

  private async removeMergeConflictIfNeed(pr: PullRequest) {
    await Promise.all([
      this.commentService.deleteMergeConflictCommentIfNeed(pr),
      this.labelService.removeMergeConflictLabelIfNeed(pr),
    ]);
  }
}
