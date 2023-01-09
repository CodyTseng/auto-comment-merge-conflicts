# auto-comment-merge-conflicts

> Github Action to automatically add comments to alert developers when there are merge conflicts

## Purpose

This action checks all unlocked open Pull Requests for merge conflicts and add a comment if need. When a conflict is resolved the comment is automatically removed.

## Usage

```
on:
  push:
    pull_request:
    branches:
    - main

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: codytseng/auto-comment-merge-conflicts@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

|    input     | description                                                   | required | default        |
| :----------: | :------------------------------------------------------------ | :------: | :------------- |
|    token     | GitHub token                                                  |   true   |                |
| comment-body | Comment body                                                  |  false   | Merge Conflict |
|   wait-ms    | Milliseconds between retries                                  |  false   | 3000           |
| max-retries  | The number of retries when a PR mergeable status is `UNKNOWN` |  false   | 5              |

## How does it work?

1. Get all unlocked open PRs. (Will wait `${wait-ms}` ms and retry if it contains a PR with `UNKNOWN` mergeable status.)
2. If the mergeable status of PR is `CONFLICTING` and this PR has no `${comment-body}` comments, a `${comment-body}` comment will be automatically added.
3. If the mergeable status of PR is `MERGEABLE` and this PR has a `${comment-body}` comment, the comment will be automatically removed.
