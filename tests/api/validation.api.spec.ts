import { expect, test } from "@playwright/test";

test.describe("API pública — validação sem gravações", () => {
  test("recusa agendamento incompleto antes de acessar o banco", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {
        service: "Corte masculino",
        date: "2030-01-02",
        time: "10:00",
        name: "Cliente Teste",
        phone: "48999999999",
        privacyAccepted: false,
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Confira os dados do agendamento.",
    });
  });

  test("recusa serviço e horário fora da lista permitida", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {
        service: "Serviço inventado",
        date: "2030-01-02",
        time: "10:30",
        name: "Cliente Teste",
        phone: "48999999999",
        privacyAccepted: true,
      },
    });

    expect(response.status()).toBe(400);
  });

  test("recusa consulta de disponibilidade com data inválida", async ({ request }) => {
    const response = await request.get("/api/availability?date=02-01-2030");
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Data inválida." });
  });

  test("recusa link de gerenciamento malformado", async ({ request }) => {
    const response = await request.post("/api/bookings/manage", { data: { id: "invalido", token: "curto" } });
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Link de agendamento inválido.",
    });
  });

  test("recusa alteração sem credenciais válidas", async ({ request }) => {
    const response = await request.patch("/api/bookings/manage", {
      data: { id: "invalido", token: "curto", action: "cancel" },
    });
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Alteração inválida." });
  });

  test("protege a disponibilidade administrativa sem sessão", async ({ request }) => {
    const response = await request.get("/api/barbeiro/disponibilidade");
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Não autorizado." });
  });
});
