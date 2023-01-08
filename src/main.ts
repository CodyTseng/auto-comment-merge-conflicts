import * as core from '@actions/core';
import { run } from './run';

async function main() {
  try {
    await run();
  } catch (err) {
    core.setFailed(err as Error);
  }
}

main();
