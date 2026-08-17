# Testes automatizados — D.BarberShop

Esta suíte valida os fluxos mais importantes sem criar, alterar ou apagar dados no
Supabase de produção.

## O que é coberto

- validações e proteção das APIs públicas;
- acesso restrito ao painel do barbeiro;
- menu e conversão da página inicial em desktop e celular;
- agendamento completo com consentimento de privacidade;
- conflito quando o horário é reservado por outra pessoa;
- link seguro para cancelamento e reagendamento;
- carregamento da agenda e dos clientes no painel.

Nos testes visuais, todas as respostas do banco são simuladas com `page.route`.
Os testes de API enviam somente dados inválidos, que são recusados antes de qualquer
gravação.

## Execução

```bash
npm run test:api
npm run test:e2e
```

Na primeira execução local, instale os navegadores:

```bash
npx playwright install chromium webkit
```

Em caso de falha, o Playwright preserva captura de tela, vídeo e trace para análise.
