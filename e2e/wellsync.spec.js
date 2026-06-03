import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5173";

// login 
async function login(page, email = "admin@wellsync.com", password = "admin123") {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

//authentication  
test.describe("Authentication", () => {
  test("landing page is visible before login", async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveURL(/landing/);
    await expect(page.getByText("WellSync Enterprise")).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("shows error for short password", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', "user@test.com");
    await page.fill('input[type="password"]', "ab");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/at least 4/i)).toBeVisible();
  });

  test("successful login redirects to welcome/clarity page", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/welcome/);
    await expect(page.getByText("WellSync Enterprise")).toBeVisible();
  });

  test("cannot access dashboard without login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveURL(/login/);
  });

  test("cannot access services without login", async ({ page }) => {
    await page.goto(`${BASE}/services`);
    await expect(page).toHaveURL(/login/);
  });

  
});


//resource detail view
test.describe("Resource Detail", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/services`);
    await page.locator("tbody tr").first().click();
    await expect(page).toHaveURL(/services\/\d+/);
  });

  test("detail page shows resource name", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("Edit button opens modal", async ({ page }) => {
    await page.getByRole("button", { name: /edit resource/i }).click();
    await expect(page.getByTestId("edit-modal")).toBeVisible();
  });

  test("Back to Services link works", async ({ page }) => {
    await page.getByText(/back to services/i).first().click();
    await expect(page).toHaveURL(/services$/);
  });

  test("Delete with confirmation removes resource", async ({ page }) => {
    await page.goto(`${BASE}/services`);
    const before = await page.locator("tbody tr").count();
    await page.locator("tbody tr").first().click();
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page).toHaveURL(/services$/);
    const after = await page.locator("tbody tr").count();
    expect(after).toBe(before - 1);
  });
});

//cookies persistence 
test.describe("Cookie persistence (Silver Challenge)", () => {
  test("mood is persisted in cookie after selection", async ({ page, context }) => {
    await login(page);
    await page.getByText("Good").click();
    const cookies = await context.cookies();
    const moodCookie = cookies.find(c => c.name === "ws_mood");
    expect(moodCookie).toBeDefined();
    const val = JSON.parse(decodeURIComponent(moodCookie.value));
    expect(val.value).toBe("good");
  });

  test("username is persisted in cookie after login", async ({ page, context }) => {
    await login(page);
    const cookies = await context.cookies();
    const userCookie = cookies.find(c => c.name === "ws_username");
    expect(userCookie).toBeDefined();
  });

  test("mood cookie is cleared on logout", async ({ page, context }) => {
    await login(page);
    await page.getByText("Good").click();
    await page.goto(`${BASE}/dashboard`);
    await page.getByText(/log out/i).click();
    const cookies = await context.cookies();
    const moodCookie = cookies.find(c => c.name === "ws_mood");
    expect(moodCookie).toBeUndefined();
  });
});