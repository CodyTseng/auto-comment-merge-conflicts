import * as core from '@actions/core';
import * as github from '@actions/github';
import { describe, expect, jest, test } from '@jest/globals';
import { CommentService } from '../src/comment';
import { MergeableState } from '../src/enum';
import { LabelService } from '../src/label';
import { PullRequestService } from '../src/pull-request';
import { Runner } from '../src/run';
import { QueryService } from '../src/query';

describe('run', () => {
  test('should succeed', async () => {
    const input = {
      token: 'token',
      'wait-ms': '3000',
      'max-retries': '5',
      'comment-body': 'Merge Conflict',
      'label-name': 'conflict',
    };
    const output: Record<string, any> = {};

    const newConflictingPR = {
      id: 'prId',
      number: 1,
      url: '',
      title: '',
      headRefName: '',
      baseRefName: '',
      mergeable: MergeableState.Conflicting,
      locked: false,
      updatedAt: new Date().toUTCString(),
      comments: { nodes: [] },
      labels: { nodes: [] },
    };

    const newMergeablePR = {
      id: 'prId',
      number: 2,
      url: '',
      title: '',
      headRefName: '',
      baseRefName: '',
      mergeable: MergeableState.Mergeable,
      locked: false,
      updatedAt: new Date().toUTCString(),
      comments: {
        nodes: [{ id: 'commentId', body: input['comment-body'] }],
      },
      labels: { nodes: [{ id: 'labelId', name: input['label-name'] }] },
    };

    (github as any).context = {
      repo: { owner: 'codytseng', repo: 'auto-comment-merge-conflicts' },
    };

    jest
      .spyOn(core, 'getInput')
      .mockImplementation((name) => input[name as keyof typeof input]);
    jest
      .spyOn(core, 'setOutput')
      .mockImplementation((name, value) => (output[name] = value));
    jest.spyOn(github, 'getOctokit').mockImplementation(() => ({} as any));
    jest
      .spyOn(PullRequestService.prototype, 'getAllUnlockedPRs')
      .mockResolvedValue([newConflictingPR, newMergeablePR]);
    jest
      .spyOn(QueryService.prototype, 'getRepositoryLabels')
      .mockResolvedValue({
        repository: {
          labels: {
            nodes: [
              {
                id: 'labelId',
                name: input['label-name'],
              },
            ],
          },
        },
      });

    const mockAddMergeConflictCommentIfNeed = jest
      .spyOn(CommentService.prototype, 'addMergeConflictCommentIfNeed')
      .mockResolvedValue(true);
    const mockDeleteMergeConflictCommentIfNeed = jest
      .spyOn(CommentService.prototype, 'deleteMergeConflictCommentIfNeed')
      .mockResolvedValue(true);
    const mockAddMergeConflictLabelIfNeed = jest
      .spyOn(LabelService.prototype, 'addMergeConflictLabelIfNeed')
      .mockResolvedValue(true);
    const mockRemoveMergeConflictLabelIfNeed = jest
      .spyOn(LabelService.prototype, 'removeMergeConflictLabelIfNeed')
      .mockResolvedValue(true);

    const runner = new Runner();
    await runner.init();
    await runner.run();

    expect(mockAddMergeConflictCommentIfNeed).toBeCalledTimes(1);
    expect(mockDeleteMergeConflictCommentIfNeed).toBeCalledTimes(1);
    expect(mockAddMergeConflictLabelIfNeed).toBeCalledTimes(1);
    expect(mockRemoveMergeConflictLabelIfNeed).toBeCalledTimes(1);
    expect(output).toEqual({
      'new-conflicting-prs': JSON.stringify([
        PullRequestService.toOutputPR(newConflictingPR),
      ]),
      'new-mergeable-prs': JSON.stringify([
        PullRequestService.toOutputPR(newMergeablePR),
      ]),
    });
  });
});
