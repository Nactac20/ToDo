import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ToDo/',
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        diary: './diary.html',
        planner: './planner.html',
        profile: './profile.html',
        stats: './stats.html',
      },
    },
  },
});