import * as core from '@actions/core';
import { PullRequest } from './interface';
import { QueryService } from './query';

export class LabelService {
  private labelId?: string;

  constructor(
    private readonly queryService: QueryService,
    private readonly labelName?: string,
  ) {}

  async init() {
    if (!this.labelName) return;

    const repoLabels = await this.queryService.getRepositoryLabels();
    if (!repoLabels || !repoLabels.repository) {
      throw new Error(
        `Failed to get list of labels: ${JSON.stringify(repoLabels)}`,
      );
    }

    const mergeConflictLabel = repoLabels.repository.labels.nodes.find(
      (label) => label.name === this.labelName,
    );
    if (!mergeConflictLabel)
      throw new Error(`The label ${this.labelName} not found.`);

    this.labelId = mergeConflictLabel.id;
  }

  async addMergeConflictLabelIfNeed(
    pr: Pick<PullRequest, 'labels' | 'number' | 'id'>,
  ) {
    if (!this.labelId) return false;
    const label = this.findMergeConflictLabel(pr);

    if (label) return false;

    await this.queryService.addLabel(pr.id, this.labelId);
    core.info(`Added a merge conflict label to #${pr.number} PR.`);
    return true;
  }

  async removeMergeConflictLabelIfNeed(
    pr: Pick<PullRequest, 'labels' | 'number' | 'id'>,
  ) {
    if (!this.labelId) return false;
    const label = this.findMergeConflictLabel(pr);

    if (!label) return false;

    await this.queryService.removeLabel(pr.id, this.labelId);
    core.info(`Remove a merge conflict label to #${pr.number} PR.`);
    return true;
  }

  private findMergeConflictLabel(pr: Pick<PullRequest, 'labels'>) {
    return pr.labels.nodes.find((label) => label.name === this.labelName);
  }
}
