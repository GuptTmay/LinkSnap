import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Disable running test files in parallel 
    // Avoids race condition between 2 Parallel running tests. 
    fileParallelism: false, 
  },
});