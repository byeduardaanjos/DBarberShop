import { expect, test } from "@playwright/test";

const bookingId = "123e4567-e89b-42d3-a456-426614174000";
const token = "s".repeat(72);
const originalBooking = {
  id: bookingId,
  customer_name: "Cliente QA",
  booking_date: "2030-01-02",
  booking_time: "10:00:00",
  status: "confirmed",
  service_name: "Corte masculino",
  duration_minutes: 50,
};

test.describe("Cliente — autogestão do agendamento", () => {
  test("cancela apenas após confirmação explícita", async ({ page }) => {
    let cancelled = false;
    await page.route("**/api/bookings/manage", async route => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ booking: { ...originalBooking, status: cancelled ? "cancelled" : "confirmed" } }) });
        return;
      }
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({ id: bookingId, token, action: "cancel" });
      cancelled = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{\"success\":true}" });
    });

    await page.goto(`/agendamento/${bookingId}#token=${token}`);
    await expect(page.getByText("Confirmado", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancelar horário" }).click();
    await expect(page.getByRole("heading", { name: "Cancelar este horário?" })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
    await expect(page.getByText("Cancelado", { exact: true })).toBeVisible();
  });

  test("reagenda usando somente um horário disponível", async ({ page }) => {
    let changed = false;
    await page.route("**/api/availability?date=*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: ["15:00"] }),
      });
    });
    await page.route("**/api/bookings/manage", async route => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ booking: { ...originalBooking, booking_time: changed ? "15:00:00" : "10:00:00" } }) });
        return;
      }
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({ id: bookingId, token, action: "reschedule", time: "15:00" });
      changed = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{\"success\":true}" });
    });

    await page.goto(`/agendamento/${bookingId}#token=${token}`);
    await page.getByRole("button", { name: "Reagendar" }).click();
    await page.locator(".calendar-grid button:not([disabled])").first().click();
    await expect(page.getByRole("button", { name: "10:00" })).toBeDisabled();
    await page.getByRole("button", { name: "15:00" }).click();
    await page.getByRole("button", { name: /Confirmar novo horário/ }).click();
    await expect(page.getByText("15:00 · 50 min")).toBeVisible();
  });
});
