import * as github from '@actions/github';

export type GitHub = ReturnType<typeof github.getOctokit>;

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
}

export interface PullRequest {
  id: string;
  number: string;
  mergeable: string;
  locked: boolean;
  updatedAt: string;
  comments: {
    nodes: Comment[];
  };
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface RepositoryPullRequests {
  repository: {
    pullRequests: {
      nodes: PullRequest[];
      pageInfo: PageInfo;
    };
  };
}
