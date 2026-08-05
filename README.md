# D.BarberShop — Next.js 16

Site institucional e sistema de agendamento da D.BarberShop.

## Requisitos

- Node.js 20.9 ou superior
- npm

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm start
```

O build padrão gera a pasta `.next`.

## Deploy na Vercel

1. Envie esta pasta para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Mantenha o framework detectado como **Next.js**.
4. Use `npm run build` como comando de build.

Cadastre na Vercel as variáveis de `.env.example` para os ambientes Production, Preview e Development.

O projeto utiliza somente a estrutura padrão do Next.js e está pronto para a Vercel.

## Observação

O banco é criado pela migration em `supabase/migrations`. O calendário consulta horários ocupados em tempo real e impede reservas duplicadas.
