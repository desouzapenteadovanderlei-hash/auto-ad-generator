# auto-ad-generator

Breve instruções para build e deploy (GitHub Actions)

- Build localmente:

```bash
npm ci
npm run build
# preview (opcional)
npx vite preview
```

- O workflow de CI está em `.github/workflows/deploy.yml`:
  - Dispara em `push` para a branch `main`.
  - Usa Node.js `24` no runner.
  - Executa `npm ci` e `npm run build` e publica `./.output/public` no branch `gh-pages`.
  - Garante permissões `contents: write` e `pages: write` para `GITHUB_TOKEN`.

- Observações:
  - Se precisar de domínio custom adicione um arquivo `CNAME` na raiz da pasta publicada ou configure via settings do GitHub Pages.
  - Caso precise que o workflow rode em outra branch, edite `on.push.branches` em `.github/workflows/deploy.yml`.

Se quiser, eu adiciono instruções mais detalhadas ou crio um `Makefile`/scripts npm para facilitar.
