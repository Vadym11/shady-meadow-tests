import { test, expect, type Page } from '@playwright/test';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'password';

async function loginAsAdmin(page: Page) {
    await page.goto('/admin');
    await page.getByLabel('Username').fill(ADMIN_USER);
    await page.getByLabel('Password').fill(ADMIN_PASS);
    await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Admin Dashboard', () => {

    // Actual redirect is '/admin/rooms'
    test.skip('should redirect to dashboard/inboxes after login', async ({ page }) => {
        await loginAsAdmin(page);
        
        await page.waitForURL('**/dashboard/inboxes');
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    test('should redirect to admin/rooms after login', async ({ page }) => {
        await loginAsAdmin(page);

        await page.waitForURL('**/admin/rooms');
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    test('admin room details should match public homepage', async ({ page }) => {
        await page.goto('/');

        const roomElements = page.locator('#rooms').locator('.room-card');
        await expect(roomElements).not.toHaveCount(0);

        const roomsInfo = [];
        for (const roomLocator of await roomElements.all()) {
            const amenitiesText = (await roomLocator.locator('.card-text').nth(1).textContent() ?? '').trim();
            roomsInfo.push({
                roomType: (await roomLocator.getByRole('heading').textContent()) ?? '',
                price: (await roomLocator.getByText(/£[\d.]+/).textContent() ?? '0').replace(/[^0-9.]/g, ''),
                amenities: amenitiesText.split(' ').sort(),
            });
        }

        await loginAsAdmin(page);

        await expect(page.getByTestId('roomlisting').first()).toBeVisible();
        const roomListings = await page.getByTestId('roomlisting').all();

        for (const room of roomListings) {
            const roomType = await room.locator('[id^="type"]').textContent();
            const roomPrice = await room.locator('[id^="roomPrice"]').textContent();
            const amenities = (await room.locator('[id^="details"]').textContent() ?? '').trim().split(', ').sort();

            const expectedRoom = roomsInfo.find(info => info.roomType === roomType);
            expect(expectedRoom, `No homepage room matched admin room type "${roomType}"`).toBeDefined();
            expect(roomPrice).toBe(expectedRoom!.price);
            expect(amenities).toEqual(expectedRoom!.amenities);
        }
    });
});
