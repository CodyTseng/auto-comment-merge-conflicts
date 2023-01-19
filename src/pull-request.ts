import { MergeableState } from './enum';
import { OutputPullRequest, PullRequest } from './interface';
import { QueryService } from './query';

type PRFilterFn = (pr: PullRequest) => boolean;

type PullRequestServiceOptions = {
  ignoreAuthors?: string[];
};

export class PullRequestService {
  private prFilterFn: PRFilterFn;

  constructor(
    private readonly queryService: QueryService,
    options?: PullRequestServiceOptions,
  ) {
    this.prFilterFn = this.getPRFilterFn(options);
  }

  async getAllPRs() {
    let cursor: string | undefined;
    let hasNextPage = true;

    const prs: PullRequest[] = [];

    while (hasNextPage) {
      const repoPRs = await this.queryService.getRepositoryPullRequests(cursor);

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
        if (this.prFilterFn(pr)) {
          prs.push(pr);
        }
      }

      cursor = repoPRs.repository.pullRequests.pageInfo.endCursor;
      hasNextPage = repoPRs.repository.pullRequests.pageInfo.hasNextPage;
    }

    return prs;
  }

  static toOutputPR(pr: PullRequest): OutputPullRequest {
    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      url: pr.url,
      baseRefName: pr.baseRefName,
      headRefName: pr.headRefName,
    };
  }

  private getPRFilterFn(options: PullRequestServiceOptions = {}): PRFilterFn {
    const { ignoreAuthors = [] } = options;
    return (pr: PullRequest) => {
      return !pr.locked && !ignoreAuthors.includes(pr.author.login);
    };
  }
}
