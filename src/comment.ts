import * as core from '@actions/core';
import { PullRequest } from './interface';
import { QueryService } from './query';

export class CommentService {
  constructor(
    private readonly queryService: QueryService,
    private readonly commentBody: string,
  ) {}

  async addMergeConflictCommentIfNeed(
    pr: Pick<PullRequest, 'comments' | 'id' | 'number'>,
  ): Promise<boolean> {
    const mergeConflictComment = this.findMergeConflictComment(pr);
    if (mergeConflictComment) return false;

    await this.queryService.addComment(pr.id, this.commentBody);
    core.info(`Added a merge conflict comment to #${pr.number} PR.`);
    return true;
  }

  async deleteMergeConflictCommentIfNeed(
    pr: Pick<PullRequest, 'comments' | 'number'>,
  ): Promise<boolean> {
    const mergeConflictComment = this.findMergeConflictComment(pr);
    if (!mergeConflictComment) return false;

    await this.queryService.deleteComment(mergeConflictComment.id);
    core.info(`Deleted a merge conflict comment from #${pr.number} PR.`);
    return true;
  }

  private findMergeConflictComment(pr: Pick<PullRequest, 'comments'>) {
    return pr.comments.nodes.find(
      (comment) => comment.body === this.commentBody,
    );
  }
}
