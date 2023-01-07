import { GitHub } from './interface';

export async function addMergeConflictComment(
  octokit: GitHub,
  prId: string,
  commentBody: string,
) {
  const query = `mutation ($subjectId: String!, $body: String!) {
    addComment(input: {
      subjectId: $subjectId
      body: $body
    }) {
      clientMutationId
    }
  }`;

  return octokit.graphql(query, {
    subjectId: prId,
    body: commentBody,
  });
}
