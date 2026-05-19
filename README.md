# Shady Meadows B&B — Test Automation Suite

Automated test suite for the [Shady Meadows B&B](https://automationintesting.online/) platform, covering API validation with Karate DSL and UI automation with Playwright.

---

## Repository Structure

```
shady-meadows-tests/
├── karate-api/        # Karate DSL API tests (Java/Maven)
├── playwright-ui/     # Playwright UI tests (TypeScript)
└── README.md
```

---

## Part 1: Karate API Tests

### Prerequisites

- Java 17
- Maven 3.8+

### Running the Tests

Run all tests from the `karate-api/` directory:

```bash
mvn test
```

Run a specific feature:

```bash
mvn test -Dtest=BrandingRunner
mvn test -Dtest=RoomsRunner
mvn test -Dtest=BookingRunner
```

### Viewing Reports

After a test run, open the HTML report in your browser:

```
karate-api/target/karate-reports/karate-summary.html
```

The report includes per-feature pass/fail status, request/response logs, and scenario timings.

---

## Part 2: Playwright UI Tests

### Prerequisites

- Node.js 18+
- npm

### Setup

Install dependencies and browsers from the `playwright-ui/` directory:

```bash
npm install
npx playwright install
```

### Running the Tests

Run all tests:

```bash
npx playwright test
```

Run a specific file:

```bash
npx playwright test tests/homepage.spec.ts
npx playwright test tests/admin.spec.ts
```

Run in headed mode (visible browser):

```bash
npx playwright test --headed
```

### Viewing Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```

### Environment Variables

Admin credentials can be overridden via environment variables:

```bash
ADMIN_USER=admin ADMIN_PASS=password npx playwright test
```

If not provided, the tests fall back to the default credentials (`admin` / `password`).

---

## Approach

### API Testing (Karate)

Three feature files cover the required microservices:

- **branding.feature** — validates the `GET /api/branding` response, asserting the B&B name is exactly `"Shady Meadows B&B"` and the contact email matches a valid email regex. A reusable `emailValidator.js` helper is used for the email assertion.
- **rooms.feature** — validates the `GET /api/room` response, asserting the response contains an array of rooms with at least one room with a `roomPrice` greater than 0.
- **booking.feature** — validates the full booking flow: calls `GET /api/room` with checkin and checkout date parameters to retrieve rooms available for those dates, selects the first room from the response, and creates a booking via `POST /api/booking`. Date generation is handled by a reusable `dates.js` helper, ensuring checkout is always after checkin.

Dynamic data (room IDs, dates) is handled via Karate's built-in JavaScript support rather than hardcoded values.

### UI Testing (Playwright)

Two test files cover the required user journeys:

- **homepage.spec.ts** — navigates to the homepage, asserts the contact form fields are visible using `data-testid` attributes, and verifies "Book now" buttons are present in the rooms section.
- **admin.spec.ts** — logs in via the admin portal, asserts the redirect and Logout button visibility, and (bonus) cross-references room details from the public homepage against the admin Rooms panel.

A `loginAsAdmin` helper function is used to avoid duplication across tests. Admin credentials are read from environment variables with a fallback to defaults.

#### A note on selectors

User-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByTestId`) are used throughout. The one exception is the admin Rooms panel, where CSS attribute selectors (`[id^="type"]`, `[id^="roomPrice"]`, `[id^="details"]`) were necessary — the room listing elements have no accessible names or ARIA roles that would allow semantic targeting. This is itself a testability issue worth noting: adding `aria-label` or `data-testid` attributes to those elements would make them more robust to test against.

---

## Issues Discovered

### 1. Admin redirect goes to `/admin/rooms`, not `/dashboard/inboxes`
After login, the admin portal redirects to `https://automationintesting.online/admin/rooms` rather than a Dashboard or Inboxes view as described in the brief. This may indicate the brief is outdated or the dashboard feature is not yet implemented. The test asserting the expected redirect (`/dashboard/inboxes`) is skipped, with a passing test added that asserts the actual behaviour (`/admin/rooms`).

### 2. Contact form missing accessible name
The contact `<form>` element does not have an `aria-label` or `aria-labelledby` attribute. This means screen reader users cannot identify the form by its role when navigating by landmarks. Recommended fix:
```html
<form aria-label="Contact Form">
```

### 3. "Book this room" button label mismatch
The task brief refers to "Book this room" buttons on the homepage, but the actual button label in the UI is "Book now". The test asserting `"Book this room"` is skipped, with a passing test added that asserts the actual label `"Book now"`.

### 4. Admin room listing elements are poorly designed for testability
The room listing rows in the admin panel use dynamically constructed `id` attributes (e.g. `id="typeSingle"`, `id="roomPrice100"`) that embed the value into the identifier. These elements have no `data-testid` attributes or ARIA roles, making semantic targeting impossible and forcing the use of CSS attribute selectors (`[id^="type"]`, `[id^="roomPrice"]`). Adding `data-testid` attributes would significantly improve testability and maintainability.

### 5. Booking conflict error message could be more descriptive
When a booking is attempted for dates that overlap or are identical to an existing booking for the same room, the API correctly returns a `409 Conflict` status. However, the response body provides no actionable detail:
```json
{
    "error": "Failed to create booking"
}
```
This is a recommendation rather than a defect — the error message would be more useful if it indicated the reason for the conflict, such as the conflicting date range or the affected room ID.

### 6. `depositpaid` field is not required for booking creation
The `POST /api/booking` endpoint accepts and processes booking requests without the `depositpaid` field, despite it being documented as part of the booking payload. This could lead to bookings being created with an undefined deposit status.

### 7. Booking endpoint accepts non-existent room IDs
The `POST /api/booking` endpoint accepts `roomid` values that are not returned by the `GET /api/room` endpoint. A booking created with a non-existent room ID should be rejected with an appropriate error response rather than accepted.

---

## CI/CD Integration

Both test suites can be integrated into a CI/CD pipeline (e.g. GitHub Actions) with minimal configuration.

A typical pipeline would:
1. Trigger on pull requests and pushes to `main`
2. Run Karate tests in the `karate-api/` directory via `mvn test`
3. Run Playwright tests in the `playwright-ui/` directory via `npx playwright test`
4. Upload HTML reports as build artifacts for review

Example GitHub Actions workflow:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  karate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Run Karate tests
        working-directory: karate-api
        run: mvn test
      - name: Upload Karate report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: karate-report
          path: karate-api/target/karate-reports/

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: playwright-ui
        run: npm install
      - name: Install browsers
        working-directory: playwright-ui
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        working-directory: playwright-ui
        run: npx playwright test
        env:
          ADMIN_USER: ${{ secrets.ADMIN_USER }}
          ADMIN_PASS: ${{ secrets.ADMIN_PASS }}
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-ui/playwright-report/
```

Admin credentials are stored as GitHub Actions secrets and injected as environment variables at runtime, keeping sensitive data out of the codebase.
