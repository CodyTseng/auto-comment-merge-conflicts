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

export interface Actor {
  login: string;
}

export interface PullRequest {
  id: string;
  author: Actor;
  number: number;
  title: string;
  url: string;
  headRefName: string;
  baseRefName: string;
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

export interface OutputPullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  headRefName: string;
  baseRefName: string;
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
