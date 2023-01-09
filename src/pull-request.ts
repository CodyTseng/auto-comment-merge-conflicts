import { MergeableState } from './enum';
import { PullRequest } from './interface';
import { QueryService } from './query';

export class PullRequestService {
  constructor(
    private readonly queryService: QueryService,
    private readonly owner: string,
    private readonly repo: string,
  ) {}

  async getAllUnlockedPRs() {
    let cursor: string | undefined;
    let hasNextPage = true;

    const unlockedPRs: PullRequest[] = [];

    while (hasNextPage) {
      const repoPRs = await this.queryService.getRepositoryPullRequests(
        this.owner,
        this.repo,
        cursor,
      );

      if (!repoPRs || !repoPRs.repository) {
        throw new Error(
          `Failed to get list of PRs: ${JSON.stringify(repoPRs)}`,
        );
      }

      for (const pr of repoPRs.repository.pullRequests.nodes) {
        if (pr.mergeable === MergeableState.Unknown) {
          throw new Error(
            'There is a pull request with unknown mergeable status.',
          );
        }
        if (!pr.locked) {
          unlockedPRs.push(pr);
        }
      }

      cursor = repoPRs.repository.pullRequests.pageInfo.endCursor;
      hasNextPage = repoPRs.repository.pullRequests.pageInfo.hasNextPage;
    }

    return unlockedPRs;
  }
}
