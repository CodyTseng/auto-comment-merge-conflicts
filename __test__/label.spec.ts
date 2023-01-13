import { Context } from '@actions/github/lib/context';
import { describe, expect, jest, test } from '@jest/globals';
import { QueryService } from '../src/query';
import { LabelService } from './../src/label';

describe('LabelService', () => {
  const owner = 'codytseng';
  const repo = 'auto-comment-merge-conflicts';
  const label = {
    id: 'labelId',
    name: 'testing',
  };
  const queryService = new QueryService(
    {} as any,
    { repo: { owner, repo } } as Context,
  );

  describe('init', () => {
    test('should init successfully', async () => {
      const labelService = new LabelService(queryService, label.name);
      jest.spyOn(queryService, 'getRepositoryLabels').mockResolvedValue({
        repository: {
          labels: {
            nodes: [label],
          },
        },
      });

      await labelService.init();
      expect((labelService as any).labelId).toBe(label.id);
    });

    test('should return directly', async () => {
      const labelService = new LabelService(queryService);
      const mockGetRepositoryLabels = jest
        .spyOn(queryService, 'getRepositoryLabels')
        .mockResolvedValue({} as any);

      await labelService.init();
      expect((labelService as any).labelId).toBeUndefined();
      expect(mockGetRepositoryLabels).not.toBeCalled();
    });

    test('should throw an error when the label not found', async () => {
      const nonexistingLabel = 'nonexistingLabel';
      const labelService = new LabelService(queryService, nonexistingLabel);
      jest.spyOn(queryService, 'getRepositoryLabels').mockResolvedValue({
        repository: {
          labels: {
            nodes: [label],
          },
        },
      });

      expect(labelService.init()).rejects.toThrow(
        `The label ${nonexistingLabel} not found.`,
      );
    });

    test('should throw an error when response data is empty', async () => {
      const labelService = new LabelService(queryService, label.name);
      const response1: any = undefined;
      jest
        .spyOn(queryService, 'getRepositoryLabels')
        .mockResolvedValue(response1);
      expect(labelService.init()).rejects.toThrow(
        `Failed to get list of labels: ${JSON.stringify(response1)}`,
      );

      const response2: any = {};
      jest
        .spyOn(queryService, 'getRepositoryLabels')
        .mockResolvedValue(response2);
      expect(labelService.init()).rejects.toThrow(
        `Failed to get list of labels: ${JSON.stringify(response2)}`,
      );
    });
  });

  describe('addMergeConflictLabelIfNeed', () => {
    test('should add a merge conflict label', async () => {
      const labelService = new LabelService(queryService, label.name);
      (labelService as any).labelId = label.id;
      const mockAddLabel = jest
        .spyOn(queryService, 'addLabel')
        .mockResolvedValue();

      const result = await labelService.addMergeConflictLabelIfNeed({
        id: 'prId',
        number: 1,
        labels: { nodes: [] },
      });
      expect(result).toBeTruthy();
      expect(mockAddLabel).toBeCalledTimes(1);
    });

    test('should return false directly when there is no label id', async () => {
      const labelService = new LabelService(queryService);
      const mockFindMergeConflictLabel = jest
        .spyOn(labelService as any, 'findMergeConflictLabel')
        .mockReturnValue({});

      const result = await labelService.addMergeConflictLabelIfNeed({} as any);
      expect(result).toBeFalsy();
      expect(mockFindMergeConflictLabel).not.toBeCalled();
    });

    test('should return false when the merge conflict label already exists', async () => {
      const labelService = new LabelService(queryService, label.name);
      (labelService as any).labelId = label.id;

      const result = await labelService.addMergeConflictLabelIfNeed({
        id: 'prId',
        number: 1,
        labels: { nodes: [label] },
      });
      expect(result).toBeFalsy();
    });
  });

  describe('removeMergeConflictLabelIfNeed', () => {
    test('should remove the merge conflict label', async () => {
      const labelService = new LabelService(queryService, label.name);
      (labelService as any).labelId = label.id;
      const mockRemoveLabel = jest
        .spyOn(queryService, 'removeLabel')
        .mockResolvedValue();

      const result = await labelService.removeMergeConflictLabelIfNeed({
        id: 'prId',
        number: 1,
        labels: { nodes: [label] },
      });
      expect(result).toBeTruthy();
      expect(mockRemoveLabel).toBeCalledTimes(1);
    });

    test('should return false directly when there is no label id', async () => {
      const labelService = new LabelService(queryService);
      const mockFindMergeConflictLabel = jest
        .spyOn(labelService as any, 'findMergeConflictLabel')
        .mockReturnValue({});

      const result = await labelService.removeMergeConflictLabelIfNeed(
        {} as any,
      );
      expect(result).toBeFalsy();
      expect(mockFindMergeConflictLabel).not.toBeCalled();
    });

    test('should return false when the merge conflict label cannot be found', async () => {
      const labelService = new LabelService(queryService, label.name);
      (labelService as any).labelId = label.id;

      const result = await labelService.removeMergeConflictLabelIfNeed({
        id: 'prId',
        number: 1,
        labels: { nodes: [] },
      });
      expect(result).toBeFalsy();
    });
  });
});
