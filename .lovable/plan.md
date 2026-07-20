
# Favoritos e alertas de ofertas

Hoje o projeto só tem a calculadora de financiamento — não existe cadastro de veículos, login nem estoque. Para "salvar favoritos e receber lembretes de ofertas" precisamos montar essa base junto.

## Experiência do cliente final

1. **Login/cadastro** por e-mail+senha e Google.
2. **Estoque** (`/estoque`) e detalhe do veículo (`/veiculos/:id`) com botão ❤️ favoritar.
3. **Meus favoritos** (`/favoritos`) com selo quando o veículo está em oferta e histórico de preço.
4. **Preferências de alerta** (`/preferencias`): queda de preço, promoção, oferta da semana, última unidade.
5. **Notificações**: e-mail automático (Lovable Emails) + sininho no site com não lidas.

## Painel do lojista

- `/admin` protegido por papel `admin`:
  - CRUD de veículos (fotos, preço, status).
  - Toggles: `promoção`, `oferta_semana`, `última_unidade`.
  - Contagem de favoritadores por veículo.
- Ao alterar preço/flags, trigger cria as notificações para quem favoritou conforme a preferência.

## Dados (Lovable Cloud)

- `profiles`, `user_roles` + função `has_role`.
- `vehicles` (marca, modelo, ano, km, preço, preço_anterior, status, flags de oferta, fotos, descrição).
- `vehicle_price_history`.
- `favorites`, `alert_preferences`, `offer_notifications`.
- Trigger em `vehicles` gera notificações; RLS em tudo.

## E-mail

- Endpoint `/api/public/hooks/send-offer-alerts` chamado a cada 15 min por `pg_cron`, envia por Lovable Emails.

## Fora do escopo

- SMS/WhatsApp/push, editor visual de e-mail.

Quero começar já pela migração + auth. Posso incluir alguns veículos fictícios para você testar antes de cadastrar os reais?
