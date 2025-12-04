import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

/**
 * Vendor Registration E2E Test
 * 
 * Tests the happy path: registration -> KYC submit -> payment stub -> dashboard
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

test.describe("Vendor Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route("**/api/vendor/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          vendor: {
            vendor_id: "test_vendor_123",
            business_name: "Test Business",
            email: "test@example.com",
            phone: "+254700000000",
            created_at: new Date().toISOString(),
          },
          token: "mock_token",
        }),
      });
    });

    await page.route("**/api/vendor/kyc/upload", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route("**/api/vendor/kyc/status**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "verified",
          submitted_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
        }),
      });
    });

    await page.route("**/api/vendor/subscriptions/plans", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "basic",
            name: "Basic Vendor",
            monthly_kes: 2000,
            annual_discount_pct: 10,
            sku_limit: 50,
            features: ["Basic Dashboard", "Order Tracking"],
          },
        ]),
      });
    });

    await page.route("**/api/vendor/subscriptions/intent", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          intent_id: "mock_intent_123",
          payment_url: "https://mock-payment.com",
        }),
      });
    });

    await page.route("**/api/vendor/subscriptions/confirm", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          subscription: {
            id: "sub_123",
            plan_id: "basic",
            plan_name: "Basic Vendor",
            status: "active",
            billing_cycle: "monthly",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            auto_renew: true,
            sku_limit: 50,
          },
        }),
      });
    });

    await page.route("**/api/vendor/subscriptions**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          subscription: {
            id: "sub_123",
            plan_id: "basic",
            plan_name: "Basic Vendor",
            status: "active",
            billing_cycle: "monthly",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            auto_renew: true,
            sku_limit: 50,
          },
        }),
      });
    });
  });

  test("complete vendor registration flow", async ({ page }) => {
    // Step 1: Visit registration page
    await page.goto("/vendor/register");
    await expect(page.locator("h2")).toContainText("Vendor Registration");

    // Step 2: Fill registration form
    await page.fill('input[placeholder="Your business name"]', "Test Business");
    await page.fill('input[placeholder="your@email.com"]', "test@example.com");
    await page.fill('input[placeholder="+254 700 000 000"]', "+254700000000");
    await page.fill('input[placeholder="Minimum 8 characters"]', "password123");
    await page.fill('input[placeholder="Re-enter password"]', "password123");

    // Step 3: Submit registration
    await page.click('button:has-text("Create Vendor Account")');
    await page.waitForURL("**/vendor/verify");

    // Step 4: Upload KYC documents (simplified - just submit)
    await page.waitForSelector("h1");
    await page.click('button:has-text("Submit for Review")');

    // Step 5: Wait for redirect to subscription (after KYC is verified)
    await page.waitForURL("**/vendor/subscription", { timeout: 5000 });

    // Step 6: Select plan
    await page.click('button:has-text("Select Plan")');

    // Step 7: Confirm subscription (simplified - assume payment modal handled)
    // In real flow, would interact with payment modal here

    // Step 8: Verify redirect to dashboard
    await page.waitForURL("**/vendor/dashboard/profile", { timeout: 5000 });
    await expect(page.locator("h1")).toContainText("Profile");
  });

  test("accessibility check on verify page", async ({ page }) => {
    await page.goto("/vendor/verify");
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
});
