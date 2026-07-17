import { test, expect } from '@playwright/test';

test.describe('DataMastery Learning Flow E2E', () => {
  test('navigates from landing to dashboard to mission', async ({ page }) => {
    // Landing
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('DataMastery');
    await page.click('#landing-start-btn');
    
    // Dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Curriculum');
    
    // Open Level 1 (assumes it's unlocked by default)
    const level1Btn = page.locator('#level-1-enter-btn').first();
    await expect(level1Btn).toBeVisible();
    await level1Btn.click();
    
    // Level detail page
    await expect(page).toHaveURL(/.*\/level\/level-1/);
    const startMissionBtn = page.locator('#sublevel-1\\.1-btn').first();
    await startMissionBtn.click();
    
    // Mission View
    await expect(page).toHaveURL(/.*\/level\/level-1\/1.1/);
    
    // Expect Pyodide loading text to eventually disappear and show briefing
    await expect(page.locator('#pyodide-loading')).toBeHidden({ timeout: 25000 });
    
    // Briefing overlay should be visible
    const acceptBriefingBtn = page.locator('#accept-briefing-btn');
    await expect(acceptBriefingBtn).toBeVisible({ timeout: 5000 });
    await acceptBriefingBtn.click();
    
    // Run Code button should be visible
    const runBtn = page.locator('#run-code-btn');
    await expect(runBtn).toBeVisible();
  });
});
