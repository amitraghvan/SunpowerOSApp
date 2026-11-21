import { test, expect } from '@playwright/test';

test.describe('SolarOS ERP Shell E2E Scenarios', () => {
  test('should display ERP dashboard with all major domain cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('SolarOS ERP Architecture Overview');
    await expect(page.getByText('CRM & Inquiries')).toBeVisible();
    await expect(page.getByText('Solar Engineering & BOM')).toBeVisible();
    await expect(page.getByText('Project Execution')).toBeVisible();
  });

  test('should load technician field shell view', async ({ page }) => {
    await page.goto('/technician');
    await expect(page.locator('h1')).toContainText('Technician Field Shell');
  });

  test('should load customer self-service portal', async ({ page }) => {
    await page.goto('/portal');
    await expect(page.locator('h2')).toContainText('Welcome to Your Solar Journey');
  });
});
