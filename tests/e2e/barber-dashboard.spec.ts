import { expect, test } from "@playwright/test";

test.describe("Barbeiro — painel administrativo", () => {
  test("visitante vê somente a entrada restrita", async ({ page }) => {
    await page.route("**/api/barbeiro/session", async route => {
      await route.fulfill({ status: 401, contentType: "application/json", body: "{\"authenticated\":false}" });
    });

    await page.goto("/barbeiro");
    await expect(page.getByText(/ACESSO RESTRITO/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Administração." })).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar na Central/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação do painel" })).toHaveCount(0);
  });

  test("barbeiro autenticado visualiza agenda e clientes sincronizados", async ({ page, isMobile }) => {
    await page.route("**/api/barbeiro/session", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{\"authenticated\":true}" });
    });
    await page.route("**/api/barbeiro/agendamentos?*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          bookings: [{
            id: "b1",
            customer_name: "Cliente Painel",
            customer_phone: "(48) 99999-9999",
            booking_date: "2030-01-02",
            booking_time: "10:00:00",
            status: "confirmed",
            services: { name: "Corte masculino", duration_minutes: 50 },
          }],
        }),
      });
    });
    await page.route("**/api/barbeiro/clientes", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          customers: [{
            id: "c1",
            name: "Cliente Painel",
            phone: "(48) 99999-9999",
            notes: "",
            created_at: "2030-01-01T10:00:00Z",
            updated_at: "2030-01-01T10:00:00Z",
            bookings: [],
          }],
        }),
      });
    });

    await page.goto("/barbeiro");
    if (!isMobile) await expect(page.getByText("CENTRAL ONLINE")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação do painel" })).toBeVisible();
    await page.getByRole("button", { name: /Clientes/ }).click();
    await expect(page.getByText("Cliente Painel", { exact: true })).toBeVisible();
    await expect(page.getByText("Histórico e preferências salvos automaticamente a cada agendamento.")).toBeVisible();
  });
});
