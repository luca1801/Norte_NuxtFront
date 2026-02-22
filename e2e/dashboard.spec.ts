import { expect, test } from "@playwright/test"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => localStorage.clear())
    
    await page.locator('input[type="text"]').fill("lucas")
    await page.locator('input[type="password"]').fill("admin")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 })
  })

  test("should display dashboard heading", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible()
  })

  test("should display stats cards", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator(".stats").first()).toBeVisible()
    await expect(page.getByText("Eventos Ativos")).toBeVisible()
    await expect(page.getByText("Em Estoque")).toBeVisible()
  })

  test("should navigate to events page", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /eventos/i }).click()
    await expect(page).toHaveURL(/.*events/)
  })

  test("should display username in user dropdown", async ({ page }) => {
    await page.goto("/")
    await page.locator(".fixed.top-4 .avatar").click()
    await expect(page.locator(".dropdown-content.menu")).toContainText("lucas")
  })
})
