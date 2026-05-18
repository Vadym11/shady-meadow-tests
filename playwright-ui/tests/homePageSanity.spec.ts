import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('contact form should be visible', async ({ page }) => {
      await page.getByText('Send us a message').scrollIntoViewIfNeeded();

      const fieldIds = ['ContactName', 'ContactEmail', 'ContactPhone', 'ContactSubject', 'ContactDescription'];

      for (const fieldId of fieldIds) {
        await expect(page.getByTestId(fieldId)).toBeVisible();
      }
    });

    test('"Book now" buttons should be visible', async ({ page }) => {
      const bookNowButtons = page.locator('#rooms').getByText('Book now');
      await expect(bookNowButtons).toHaveCount(3);

      for (const button of await bookNowButtons.all()) {
        await expect(button).toBeVisible();
      }
    });
});