import * as core from '@actions/core';
import { Runner } from './run';

async function main() {
  try {
    const runner = new Runner();
    await runner.init();
    await runner.run();
  } catch (err) {
    core.setFailed(err as Error);
  }
}

main();
