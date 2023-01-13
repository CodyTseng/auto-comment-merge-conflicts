import { Context } from '@actions/github/lib/context';
import { describe, expect, jest, test } from '@jest/globals';
import { CommentService } from './../src/comment';
import { QueryService } from './../src/query';

describe('CommentService', () => {
  const owner = 'codytseng';
  const repo = 'auto-comment-merge-conflicts';
  const commentBody = 'Merge Conflict';

  describe('addMergeConflictCommentIfNeed', () => {
    const queryService = new QueryService(
      {} as any,
      { repo: { owner, repo } } as Context,
    );
    const mockAddComment = jest
      .spyOn(queryService, 'addComment')
      .mockResolvedValue();

    const commentService = new CommentService(queryService, commentBody);

    test('should add a merge conflict comment', async () => {
      const result = await commentService.addMergeConflictCommentIfNeed({
        id: 'id',
        number: 1,
        comments: {
          nodes: [],
        },
      });
      expect(mockAddComment).toBeCalled();
      expect(result).toBeTruthy();
    });

    test('should not add a merge conflict comment when already contains merge conflict comments', async () => {
      const result = await commentService.addMergeConflictCommentIfNeed({
        id: 'id',
        number: 1,
        comments: {
          nodes: [
            {
              id: 'id',
              body: commentBody,
            },
          ],
        },
      });
      expect(mockAddComment).not.toBeCalled();
      expect(result).toBeFalsy();
    });
  });

  describe('deleteMergeConflictCommentIfNeed', () => {
    const queryService = new QueryService(
      {} as any,
      { repo: { owner, repo } } as Context,
    );
    const mockDeleteComment = jest
      .spyOn(queryService, 'deleteComment')
      .mockResolvedValue();

    const commentService = new CommentService(queryService, commentBody);

    test('should delete the merge conflict comment', async () => {
      const result = await commentService.deleteMergeConflictCommentIfNeed({
        number: 1,
        comments: {
          nodes: [
            {
              id: 'id',
              body: commentBody,
            },
          ],
        },
      });
      expect(mockDeleteComment).toBeCalled();
      expect(result).toBeTruthy();
    });

    test('should not delete the merge conflict comment when no merge conflict comments', async () => {
      const result = await commentService.deleteMergeConflictCommentIfNeed({
        number: 1,
        comments: {
          nodes: [],
        },
      });
      expect(mockDeleteComment).not.toBeCalled();
      expect(result).toBeFalsy();
    });
  });
});
