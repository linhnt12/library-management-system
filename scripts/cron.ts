/**
 * Cron Jobs Runner
 * Runs all registered cron jobs
 *
 * Usage:
 *   ts-node scripts/cron.ts
 *   or
 *   yarn cron
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Register tsconfig paths for @/ alias resolution
import { resolve } from 'path';
import { register } from 'tsconfig-paths';

register({
  baseUrl: resolve(__dirname, '..'),
  paths: {
    '@/*': ['./src/*'],
  },
});

import { CronManager } from '../src/lib/cron';
import { borrowReminderTask } from '../src/lib/cron/jobs';

// #region Register All Cron Jobs

console.log('========================================');
console.log('Initializing Cron Jobs...');
console.log('========================================');

// Register Borrow Request Reminder Job
// Runs every day at 00:00 (midnight)
CronManager.register({
  name: 'borrow-reminder',
  schedule: '0 0 * * *', // Every day at 00:00
  task: borrowReminderTask,
  description: 'Check BorrowRequest endDate and send reminder notifications (3 days before due)',
  enabled: true,
});

// Add more cron jobs here in the future
// Example:
// CronManager.register({
//   name: 'another-job',
//   schedule: '0 */6 * * *', // Every 6 hours
//   task: anotherTask,
//   description: 'Description of what this job does',
// });

// #endregion

// #region Display Status

const jobs = CronManager.getJobs();
console.log('========================================');
console.log(`✓ Registered ${jobs.length} cron job(s):`);
jobs.forEach(job => {
  console.log(`  - ${job.name}: ${job.schedule}${job.description ? ` (${job.description})` : ''}`);
});
console.log('========================================');
console.log('Cron jobs are running. Press Ctrl+C to stop.');

// #endregion

// #region Graceful Shutdown

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[Cron] SIGINT received, shutting down all cron jobs...');
  CronManager.stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Cron] SIGTERM received, shutting down all cron jobs...');
  CronManager.stopAll();
  process.exit(0);
});

// #endregion
