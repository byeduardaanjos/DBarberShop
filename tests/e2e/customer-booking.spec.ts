import { expect, test } from "@playwright/test";

const bookingId = "123e4567-e89b-42d3-a456-426614174000";
const manageToken = "t".repeat(72);

test.describe("Cliente — agendamento", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/availability?date=*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: ["10:00", "15:00"] }),
      });
    });
  });

  test("home possui conversão, navegação e menu acessíveis", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/D\.BarberShop/i);
    await expect(page.getByRole("heading", { name: /Precisão em cada detalhe/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agendar horário" }).first()).toBeVisible();

    if (isMobile) {
      const menu = page.getByRole("button", { name: "Abrir menu" });
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await menu.click();
      await expect(page.getByRole("navigation").getByRole("link", { name: "Serviços" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("conclui o fluxo com consentimento e entrega link seguro", async ({ page }) => {
    let submittedBody: Record<string, unknown> | undefined;
    await page.route("**/api/bookings", async route => {
      submittedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ bookingId, manageToken }),
      });
    });

    await page.goto("/?agendar=1");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Escolha seu horário." })).toBeVisible();

    await dialog.locator(".calendar-grid button:not([disabled])").first().click();
    await dialog.getByRole("button", { name: "10:00" }).click();
    await dialog.getByRole("button", { name: "Continuar" }).click();

    const confirm = dialog.getByRole("button", { name: /Confirmar agendamento/ });
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel("Seu nome").fill("Cliente QA");
    await dialog.getByLabel("WhatsApp").fill("(48) 99999-9999");
    await dialog.getByRole("checkbox").check();
    await expect(confirm).toBeEnabled();
    await confirm.click();

    await expect(dialog.getByRole("heading", { name: "Horário reservado." })).toBeVisible();
    await expect(dialog.getByText("DB-123E45")).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Cancelar ou reagendar/ })).toHaveAttribute(
      "href",
      `/agendamento/${bookingId}#token=${manageToken}`,
    );
    expect(submittedBody).toMatchObject({
      services: ["Corte Tesoura"],
      time: "10:00",
      name: "Cliente QA",
      phone: "(48) 99999-9999",
      privacyAccepted: true,
    });
  });

  test("explica quando outro cliente reserva o horário primeiro", async ({ page }) => {
    await page.route("**/api/bookings", async route => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "Esse horário acabou de ser reservado. Escolha outro." }),
      });
    });

    await page.goto("/?agendar=1");
    const dialog = page.getByRole("dialog");
    await dialog.locator(".calendar-grid button:not([disabled])").first().click();
    await dialog.getByRole("button", { name: "10:00" }).click();
    await dialog.getByRole("button", { name: "Continuar" }).click();
    await dialog.getByLabel("Seu nome").fill("Cliente Concorrência");
    await dialog.getByLabel("WhatsApp").fill("48999999999");
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: /Confirmar agendamento/ }).click();

    await expect(dialog.getByRole("alert")).toHaveText(
      "Esse horário acabou de ser reservado. Escolha outro.",
    );
  });
});
