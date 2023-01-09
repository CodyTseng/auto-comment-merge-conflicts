import { GitHub, RepositoryPullRequests } from './interface';

export class QueryService {
  constructor(private readonly octokit: GitHub) {}

  async getRepositoryPullRequests(
    owner: string,
    repo: string,
    cursor?: string,
  ) {
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
                  createdAt
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
      owner,
      repo,
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
}
