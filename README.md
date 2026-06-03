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

Run only tagged tests if needed:

```bash
mvn test -Dkarate.options="--tags @tagme"
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

Additionally, the cucumber report is also available - open in your browser:

```
karate-api/target/cucumber-html-reports/overview-features.html
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
npx playwright test tests/dashboard.spec.ts
```

Run test in a specific browser:

```bash
npx playwright test tests --project=chromium
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
- **booking.feature** — validates the full booking flow: retrieves available rooms for the target dates by calling a reusable helper feature (`get-available-rooms.feature`), selects the first available room ID from the response, and creates a booking via `POST /api/booking`.

Date generation is handled by a reusable `dates.js` helper, ensuring checkin is always in the future and checkout is always after checkin. The room ID is retrieved dynamically by calling the helper feature rather than hardcoded, keeping the test independent from data resets.

The room retrieval logic is extracted into `helpers/get-available-rooms.feature` — a reusable called feature that accepts date parameters and returns the available rooms array.

### UI Testing (Playwright)

Two test files cover the required user journeys:

- **homepage.spec.ts** — navigates to the homepage, asserts the contact form fields are visible using `data-testid` attributes, and verifies "Book now" buttons are present in the rooms section.
- **admin.spec.ts** — logs in via the admin portal, asserts the redirect and Logout button visibility, and compares room details from the public homepage against the admin Rooms panel.

A `loginAsAdmin` helper function is used to avoid code duplication across tests. Admin credentials are read from environment variables with a fallback to defaults.

#### A note on selectors

User-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByTestId`) are used throughout. The exception is the admin Rooms panel, where CSS attribute selectors (`[id^="type"]`, `[id^="roomPrice"]`, `[id^="details"]`) were necessary — the room listing elements have no accessible names or ARIA roles that would allow semantic targeting. This is itself a testability issue worth noting: adding `aria-label` or `data-testid` attributes to those elements would make them more robust to test against.

---

## Issues Discovered

### 1. Admin redirect goes to `/admin/rooms`, not `/dashboard/inboxes`
After login, the admin portal redirects to `https://automationintesting.online/admin/rooms` rather than a Dashboard or Inboxes view as described in the brief. This may indicate the brief is outdated or the dashboard feature is not yet implemented. The test asserting the expected redirect (`/dashboard/inboxes`) is skipped, with a passing test added that asserts the actual behaviour (`/admin/rooms`).

### 2. Contact form missing accessible name
The contact `<form>` element does not have an `aria-label` attribute. Suggested improvement to make the element more accessible and testable:
```html
<form aria-label="Contact Form">
```

### 3. "Book this room" button label mismatch
The task refers to "Book this room" buttons on the homepage, but the actual button label in the UI is "Book now". The test asserting `"Book this room"` is skipped, with a passing test added that asserts the actual label `"Book now"`.

### 4. Admin room listing elements are poorly designed for testability
The room listing rows in the admin panel use dynamically constructed `id` attributes (e.g. `id="typeSingle"`, `id="roomPrice100"`) that embed the value into the identifier. These elements have no `data-testid` attributes or ARIA roles, making semantic targeting impossible and forcing the use of CSS attribute selectors (`[id^="type"]`, `[id^="roomPrice"]`). Adding `data-testid` attributes would significantly improve testability and maintainability.

### 5. Booking conflict error message could be more descriptive
When a booking is attempted for dates that overlap or are identical to an existing booking for the same room, the API correctly returns a `409 Conflict` status. However, the response body provides no actionable or meaningful detail:
```json
{
    "error": "Failed to create booking"
}
```

### 6. `depositpaid` field is not required for booking creation
The `POST /api/booking` endpoint accepts and processes booking requests without the `depositpaid` field, despite it being worded as required in the booking payload.

### 7. Booking endpoint accepts non-existent room IDs
The `POST /api/booking` endpoint accepts `roomid` values that are not returned by the `GET /api/room` endpoint. A booking created with a non-existent room ID should be rejected with an appropriate error response rather than accepted.

### 8. Endpoints do not follow REST naming conventions
Both `GET /api/room` and `POST /api/booking` use singular nouns. REST convention dictates that collection endpoints should use plural nouns — `GET /api/rooms` and `POST /api/bookings` would be the correct forms.

### 9. `roomid` in request body instead of URL path
`POST /api/booking` requires `roomid` in the request body rather than URL. REST convention for creating a sub-resource would be `POST /api/rooms/1/bookings`, with the room ID expressed as a path parameter. 

### 10. API accepts unknown fields without rejection
`POST /api/booking` silently accepts unknown fields in the request body without returning a `400 Bad Request` with meaningful error message.

### 11. `depositpaid` is client-controlled
The `POST /api/booking` endpoint allows the client to assert `"depositpaid": true` directly in the request body without any payment verification.

### 12. Field names do not follow camelCase convention
JSON REST API convention is camelCase for field names. The booking payload uses all-lowercase field names — `firstname`, `lastname`, `depositpaid`, `roomid` — instead of `firstName`, `lastName`, `depositPaid`, `roomId`.

### 13. API does not enforce strict type validation on input fields
The `POST /api/booking` endpoint accepts multiple types for multiple fields without returning a `400 Bad Request`:
- `roomid` accepts both integer `1` and string `"1"` — should only accept integer
- `depositpaid` accepts both boolean `true/false` and string `"true"/"false"` — should only accept boolean

---

## CI/CD Integration

Both test suites can serve as quality gates in a CI/CD pipeline. The following describes how they would fit into a typical workflow.

### When tests run

The pipeline triggers on every pull request and/or push to `main`. After successful unit tests run, both test suites run against a dedicated test environment — a deployed test instance of an application.

Karate API tests run first: they are fast, lightweight, and don't require a browser. Only if they pass the Playwright UI tests run, avoiding spending time running browser tests in case the API layer is broken.

A failing test from any suite blocks a PR from being merged. Reports are uploaded as pipeline artifacts on every run, including failures, so the initial investigation of a failure is possible without needing to re-run locally.

In case of successful run both reports also uploaded as artifacts -> PR may be approved -> staging/production deployment.

### Credentials and environment configuration

Sensitive data (admin credentials, environment URLs) should be stored as CI secrets and injected as environment variables at runtime. The `ADMIN_USER` and `ADMIN_PASS` variables are read from the environment in the Playwright tests, falling back to defaults for local runs. The Karate `baseApiUrl` is configured via `karate-config.js`.

### Concurrency and caching

To avoid wasted CI minutes, in-progress runs on the same branch are cancelled automatically when a new commit is pushed. Maven dependencies and Playwright browser binaries are cached between runs, keyed by `pom.xml` and Playwright version respectively, so only real dependency changes trigger re-downloads.

### Reporting

HTML reports are uploaded as pipeline artifacts after every run:
- Karate: `karate-api/target/karate-reports/karate-summary.html`
- Playwright: `playwright-ui/playwright-report/index.html`
