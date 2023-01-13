import * as github from '@actions/github';

export type GitHub = ReturnType<typeof github.getOctokit>;

export interface Comment {
  id: string;
  body: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface PullRequest {
  id: string;
  number: number;
  mergeable: string;
  locked: boolean;
  updatedAt: string;
  comments: {
    nodes: Comment[];
  };
  labels: {
    nodes: Label[];
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

export interface RepositoryLabels {
  repository: {
    labels: {
      nodes: Label[];
    };
  };
}
