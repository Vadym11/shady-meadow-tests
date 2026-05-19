import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('contact form should be visible', async ({ page }) => {
      await expect(page.getByText('Send us a message')).toBeVisible();

      const fieldIds = ['ContactName', 'ContactEmail', 'ContactPhone', 'ContactSubject', 'ContactDescription'];

      for (const fieldId of fieldIds) {
        await expect(page.getByTestId(fieldId)).toBeVisible();
      }
    });

    // Bokking buttons have different actual text ("Book now")
    test.skip('"Book this room" buttons should be visible', async ({ page }) => {
      const bookNowButtons = page.locator('#rooms').getByText('Book this room');
      await expect(bookNowButtons).toHaveCount(3);

      for (const button of await bookNowButtons.all()) {
        await expect(button).toBeVisible();
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