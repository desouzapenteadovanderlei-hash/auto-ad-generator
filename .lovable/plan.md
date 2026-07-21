## Objetivo

Construir o site completo da **VSP Comércio de Veículos LTDA** com dados de exemplo e um painel administrativo funcional, protegido por autenticação e papel de admin.

## Páginas públicas

- `/` — Home: hero, destaques (ofertas da semana, promoções), simulador de financiamento (já existe) e CTA para estoque.
- `/estoque` — Listagem com filtros (marca, preço, ano, câmbio, combustível, ordenação) usando dados reais do banco.
- `/veiculo/$id` — Detalhes: galeria de fotos, ficha técnica, preço (com preço anterior riscado se houver queda), botões de favoritar, WhatsApp e "Simular financiamento" pré-preenchido.
- `/favoritos` — Lista dos veículos salvos pelo usuário logado, com badge de ofertas ativas.
- `/alertas` — Notificações de ofertas (queda de preço, promoção, oferta da semana, última unidade) + preferências do que receber.
- `/venda-seu-carro` — Formulário de avaliação (salva lead).
- `/sobre` e `/contato` — Institucionais.
- `/auth` — Login/cadastro por e-mail e Google.

## Área autenticada

- Header mostra "Entrar" ou avatar+menu conforme sessão.
- Favoritar / alertas exigem login (CTA inline se deslogado).
- Sign-out limpa cache e redireciona para `/auth`.

## Painel administrativo `/admin`

Protegido por `_authenticated` + verificação de papel `admin` via `has_role`:

- **Dashboard**: contadores (veículos ativos, leads da semana, favoritos totais).
- **Veículos**: CRUD completo (criar, editar, publicar, marcar promoção/oferta da semana/última unidade, ajustar preço — o trigger no banco dispara notificações e histórico automaticamente). Upload de fotos via storage.
- **Leads de financiamento**: lista com filtros e exportação simples.
- **Leads "Venda seu carro"**: lista.
- **Usuários & papéis**: promover/rebaixar admins.

## Banco de dados (migração única)

Confirmar/ajustar sobre o esquema existente:

- Coluna `fotos text[]` em `vehicles`, mais `ativo`, `promocao`, `oferta_semana`, `ultima_unidade`, `preco_anterior`.
- Trigger `handle_vehicle_change` conectado em `BEFORE UPDATE ON vehicles`.
- Trigger `on_auth_user_created` em `auth.users` chamando `handle_new_user`.
- GRANTs corretos em todas as tabelas públicas; RLS:
  - `vehicles`: SELECT público onde `ativo = true`; escrita apenas admin.
  - `favorites`: cada usuário gerencia os seus.
  - `offer_notifications`: usuário lê/atualiza os seus.
  - `alert_preferences`: usuário gerencia as suas.
  - `financing_leads` / `sell_leads`: INSERT público; SELECT apenas admin.
  - `user_roles`: SELECT do próprio via RLS; escrita apenas admin.
- Bucket de storage `vehicle-photos` (leitura pública, escrita admin).
- Nova tabela `sell_leads` para "venda seu carro".
- Seed de ~12 veículos de exemplo (Honda, Toyota, VW, Fiat, Hyundai etc.) com fotos placeholder.

## Autenticação

- E-mail/senha + Google (configurar provider Google).
- Perfil e papel `user` criados automaticamente via trigger.
- Primeiro admin: instrução clara para o dono cadastrar-se e promover-se via SQL/uma tela inicial de "primeiro admin" que só funciona enquanto não existir nenhum admin.

## Estrutura de arquivos (principais)

```
src/routes/
  __root.tsx            (header/nav dinâmico, footer, providers)
  index.tsx
  estoque.tsx
  veiculo.$id.tsx
  venda-seu-carro.tsx
  sobre.tsx
  contato.tsx
  auth.tsx
  _authenticated/
    favoritos.tsx
    alertas.tsx
    admin.tsx                    (layout com gate de admin)
    admin.index.tsx              (dashboard)
    admin.veiculos.tsx
    admin.veiculos.$id.tsx
    admin.leads-financiamento.tsx
    admin.leads-venda.tsx
    admin.usuarios.tsx
src/components/
  Header.tsx, Footer.tsx, VehicleCard.tsx, VehicleFilters.tsx,
  FavoriteButton.tsx, AlertBell.tsx, AdminSidebar.tsx, ...
src/lib/
  vehicles.functions.ts, favorites.functions.ts, alerts.functions.ts,
  admin.functions.ts, leads.functions.ts
```

Server functions autenticadas via `requireSupabaseAuth`; leituras públicas do estoque via cliente publicável no servidor + policy `TO anon`.

## Escopo desta entrega

Tudo acima em um único ciclo: migração + storage + seed + rotas públicas + auth + painel admin funcional. Google OAuth será configurado no mesmo turno para não quebrar o primeiro login.

## Confirmação

Se aprovado, começo pela migração (schema, RLS, triggers, seed) e sigo com o código.
