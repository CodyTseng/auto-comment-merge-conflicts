import { Context } from '@actions/github/lib/context';
import { GitHub, RepositoryLabels, RepositoryPullRequests } from './interface';

export class QueryService {
  private readonly owner: string;
  private readonly repo: string;

  constructor(private readonly octokit: GitHub, context: Context) {
    this.owner = context.repo.owner;
    this.repo = context.repo.repo;
  }

  async getRepositoryPullRequests(cursor?: string) {
    const query = `query ($owner: String!, $repo: String!, $after: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 100, states: OPEN, after: $after) {
            nodes {
              id
              number
              mergeable
              locked
              updatedAt
              comments(last: 100) {
                nodes {
                  id
                  body
                }
              }
              labels(last: 100) {
                nodes {
                  id
                  name
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }`;

    return this.octokit.graphql<RepositoryPullRequests>(query, {
      owner: this.owner,
      repo: this.repo,
      after: cursor,
    });
  }

  async addComment(prId: string, body: string) {
    const query = `mutation ($subjectId: ID!, $body: String!) {
      addComment(input: {
        subjectId: $subjectId
        body: $body
      }) {
        clientMutationId
      }
    }`;

    await this.octokit.graphql(query, {
      subjectId: prId,
      body,
    });
  }

  async deleteComment(commentId: string) {
    const query = `mutation ($id: ID!) {
      deleteIssueComment(input: {
        id: $id
      }) {
        clientMutationId
      }
    }`;

    await this.octokit.graphql(query, {
      id: commentId,
    });
  }

  async addLabel(prId: string, labelId: string) {
    const query = `mutation ($prId: ID!, $labelId: ID!) {
      addLabelsToLabelable(input: {
        labelableId: $prId
        labelIds: [$labelId]
      }) {
        clientMutationId
      }
    }`;

    await this.octokit.graphql(query, {
      prId,
      labelId,
    });
  }

  async removeLabel(prId: string, labelId: string) {
    const query = `mutation ($prId: ID!, $labelId: ID!) {
      removeLabelsFromLabelable(input: {
        labelableId: $prId
        labelIds: [$labelId]
      }) {
        clientMutationId
      }
    }`;

    await this.octokit.graphql(query, {
      prId,
      labelId,
    });
  }

  async getRepositoryLabels() {
    const query = `query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        labels(first: 100) {
          nodes {
            id
            name
          }
        }
      }
    }`;

    return await this.octokit.graphql<RepositoryLabels>(query, {
      owner: this.owner,
      repo: this.repo,
    });
  }
}
