import { expect, test } from "@playwright/test"

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => localStorage.clear())
  })

  test("should display login page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.locator('input[type="text"]').fill("invaliduser")
    await page.locator('input[type="password"]').fill("wrongpassword")
    
    const responsePromise = page.waitForResponse(resp => 
      resp.url().includes("/auth/login") && resp.status() === 401,
      { timeout: 10000 }
    )
    
    await page.getByRole("button", { name: "Entrar" }).click()
    await responsePromise
    
    await expect(page.locator(".alert-error")).toBeVisible({ timeout: 5000 })
  })

  test("should redirect to dashboard after successful login", async ({ page }) => {
    await page.locator('input[type="text"]').fill("lucas")
    await page.locator('input[type="password"]').fill("admin")
    await page.getByRole("button", { name: "Entrar" }).click()
    
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 })
  })

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/.*login/)
  })
})
