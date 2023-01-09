import * as core from '@actions/core';
import * as github from '@actions/github';
import { describe, expect, jest, test } from '@jest/globals';
import { CommentService } from '../src/comment';
import { MergeableState } from '../src/enum';
import { PullRequestService } from '../src/pull-request';
import { run } from '../src/run';

describe('run', () => {
  test('should succeed', async () => {
    const input = {
      token: 'token',
      'wait-ms': '3000',
      'max-retries': '5',
      'comment-body': 'Merge Conflict',
    };

    (github as any).context = {
      repo: { owner: 'codytseng', repo: 'auto-comment-merge-conflicts' },
    };

    jest
      .spyOn(core, 'getInput')
      .mockImplementation((name) => input[name as keyof typeof input]);
    jest.spyOn(github, 'getOctokit').mockImplementation(() => ({} as any));
    jest
      .spyOn(PullRequestService.prototype, 'getAllUnlockedPRs')
      .mockResolvedValue([
        {
          id: 'prId',
          number: 1,
          mergeable: MergeableState.Conflicting,
          locked: false,
          updatedAt: new Date().toUTCString(),
          comments: { nodes: [] },
        },
        {
          id: 'prId',
          number: 2,
          mergeable: MergeableState.Mergeable,
          locked: false,
          updatedAt: new Date().toUTCString(),
          comments: { nodes: [] },
        },
      ]);

    const mockAddMergeConflictCommentIfNeed = jest
      .spyOn(CommentService.prototype, 'addMergeConflictCommentIfNeed')
      .mockResolvedValue(true);
    const mockDeleteMergeConflictCommentIfNeed = jest
      .spyOn(CommentService.prototype, 'deleteMergeConflictCommentIfNeed')
      .mockResolvedValue(false);

    await run();
    expect(mockAddMergeConflictCommentIfNeed).toBeCalledTimes(1);
    expect(mockDeleteMergeConflictCommentIfNeed).toBeCalledTimes(1);
  });
});
