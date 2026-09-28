import { expect, test } from "@playwright/test";

test("a new visitor picks a language and class, then browses to a chapter", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole("button", { name: "अ आ इ हिंदी" }).click();
  await expect(page.getByRole("heading", { name: "अपनी कक्षा चुनें" })).toBeVisible();

  await page.getByRole("button", { name: /कक्षा 1\b/ }).click();
  await page.getByRole("button", { name: /पढ़ाई शुरू करें/ }).click();

  await expect(page).toHaveURL(/\/class\/class-1$/);
  await expect(page.getByRole("heading", { name: "कक्षा 1" })).toBeVisible();

  await page.getByRole("link", { name: /गणित/ }).click();
  await expect(page.getByRole("heading", { name: "गणित" })).toBeVisible();

  await page.getByRole("link", { name: /^4\s*जोड़/ }).click();
  await expect(page.getByRole("heading", { name: "जोड़" })).toBeVisible();
  await expect(page.getByText("Adding with Objects")).toBeVisible();

  // Audio-first class: speaker buttons are present.
  await expect(page.getByRole("button", { name: /^सुनें:/ }).first()).toBeVisible();

  // Home now remembers the class.
  await page.goto("/");
  await expect(page.getByText("कक्षा 1").first()).toBeVisible();
});

test("senior classes use the regular layout without speaker buttons", async ({ page }) => {
  await page.goto("/class/class-10/maths");
  await expect(page.getByRole("heading", { name: "Mathematics" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Quadratic Equations/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Listen:/ })).toHaveCount(0);
});

test("a child can sign up with a PIN, log out and log back in", async ({ page }) => {
  const username = `kid${Date.now().toString().slice(-8)}`;

  await page.goto("/register");
  await page.getByLabel("Your name").fill("Riya");
  await page.getByLabel("Username").fill(username);
  await page.getByRole("button", { name: "peacock" }).click();
  await page.getByLabel("Your class").selectOption("ukg");
  for (const d of ["2", "0", "1", "9"]) await page.getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/class\/ukg$/);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hello, Riya!" })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  for (const d of ["1", "1", "1", "1"]) await page.getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "Log in" }).last().click();
  await expect(page.getByText("Username or PIN is not correct")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  for (const d of ["2", "0", "1", "9"]) await page.getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "Log in" }).last().click();
  await expect(page).toHaveURL(/\/class\/ukg$/);
});

test("unknown pages show a friendly message", async ({ page }) => {
  await page.goto("/class/class-99");
  await expect(page.getByRole("heading", { name: "We could not find this page." })).toBeVisible();
});
