import fs from 'node:fs';
import path from 'node:path';
import { test, expect, chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const PRODUCTION_URL = 'http://localhost:3000';
const DEBUG_PORT = 9222;

test.describe('Lighthouse Performance Audit', () => {
  test('homepage meets performance thresholds', async () => {
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${DEBUG_PORT}`],
    });

    try {
      const result = await lighthouse(PRODUCTION_URL, {
        port: DEBUG_PORT,
        output: 'html',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      if (!result) {
        throw new Error('Lighthouse returned no result');
      }

      const reportDir = path.join(import.meta.dirname, '..', 'lighthouse-reports');
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(
        path.join(reportDir, 'lighthouse-report.html'),
        result.report as string,
      );

      const categories = result.lhr.categories;

      const scores = {
        performance: categories.performance?.score ?? 0,
        accessibility: categories.accessibility?.score ?? 0,
        bestPractices: categories['best-practices']?.score ?? 0,
        seo: categories.seo?.score ?? 0,
      };

      console.log('Lighthouse Scores:');
      console.log(`  Performance:    ${(scores.performance * 100).toFixed(0)}`);
      console.log(`  Accessibility:  ${(scores.accessibility * 100).toFixed(0)}`);
      console.log(`  Best Practices: ${(scores.bestPractices * 100).toFixed(0)}`);
      console.log(`  SEO:            ${(scores.seo * 100).toFixed(0)}`);

      expect(scores.performance).toBeGreaterThanOrEqual(0.5);
      expect(scores.accessibility).toBeGreaterThanOrEqual(0.7);
      expect(scores.bestPractices).toBeGreaterThanOrEqual(0.7);
    } finally {
      await browser.close();
    }
  });
});
