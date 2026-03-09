# FindThem — O que mais dá para adicionar (análise)

Análise do estado atual do projeto e sugestões priorizadas para evoluir o FindThem (TCC e além).

---

## Estado atual (resumo)

| Área | Situação |
|------|----------|
| **Front-end** | UI completa (registro, sighting, matches), aviso de privacidade/ética, tema “arquivo de caso”, favicon. **Não chama a API**: formulários fazem `console.log`, matches são mock. |
| **API Vercel** | Serverless (`/api/missing-persons`, `/api/sightings`, `/api/matches`) com Postgres + Blob. Sem reconhecimento facial (matches vazios ou manuais). |
| **Backend Python** | FastAPI + pipeline de faces (InsightFace/FAISS) desenhado; não sobe na Vercel. |
| **Documentação** | README, ARCHITECTURE, EXTERNAL_RESOURCES; falta DEPLOY e este roadmap. |

---

## 1. Prioridade alta (recomendado para o TCC)

### 1.1 Conectar o front à API (Vercel)

- **Registro:** em `RegisterPerson`, enviar `FormData` (nome, foto, descrição, etc.) para `POST /api/missing-persons` (ou `/api` relativo em produção). Tratar loading e erro (toast ou mensagem na tela).
- **Sighting:** em `ReportSighting`, enviar imagem + notas/local para `POST /api/sightings`. Exibir “Report filed” e, se a API devolver, lista de matches (mesmo vazia).
- **Matches:** em `Matches`, fazer `GET /api/matches` (e opcionalmente `?min_score=0.5`). Remover mock; exibir lista real ou estado vazio.
- **Base URL:** usar `const API_BASE = process.env.REACT_APP_API_URL || ''` e chamar `fetch(API_BASE + '/api/...')` para funcionar em dev (proxy ou CORS) e em produção (mesmo domínio na Vercel).

**Impacto:** o sistema fica “de ponta a ponta” no deploy da Vercel (cadastro, envio de foto, listagem de matches), mesmo sem reconhecimento facial.

### 1.2 Tratamento de erros e feedback no front

- Mensagem de erro quando a API retorna 4xx/5xx (ex.: “Não foi possível registrar. Tente de novo.”).
- Loading durante POST/GET (botão desabilitado ou spinner).
- Validação básica no cliente (ex.: foto obrigatória, tamanho máximo) antes de enviar.

### 1.3 Documentação de deploy

- **`docs/DEPLOY.md`** (ou seção no README): passo a passo para Vercel (conectar repo, criar Postgres + Blob, variáveis, deploy). Facilita banca e reprodução do ambiente.

---

## 2. Prioridade média (reforça o TCC)

### 2.1 Página ou lista de casos (missing persons)

- Rota `/missing-persons` ou “Registry” no layout: lista de pessoas cadastradas via `GET /api/missing-persons`, com card (nome, foto se houver, data de desaparecimento). Ajuda a mostrar que os dados persistem e a contextualizar os matches.

### 2.2 Filtros e ordenação em Matches

- Filtro por “score mínimo” (ex.: só ≥ 60%) e, se no futuro a API suportar, por pessoa ou por sighting. Ordenação por data ou por score já está no backend; expor no UI (tabs ou select).

### 2.3 Ajustes de acessibilidade e SEO

- Labels e roles corretos nos formulários (já parcialmente feitos); garantir foco e contraste.
- Meta tags e título por rota (React Helmet ou similar) para compartilhamento e SEO.

### 2.4 Testes automatizados

- **Front:** 1–2 testes (React Testing Library) para fluxo de registro ou de exibição de matches (mock da API).
- **Backend Python:** 1–2 testes (pytest) para um endpoint (ex.: GET missing-persons) ou para o serviço de embedding (imagem fixa → vetor).

---

## 3. Prioridade menor / pós-TCC

### 3.1 Backend Python em produção (reconhecimento facial)

- Deploy do `backend/` em Railway, Render ou Fly.io; configurar Postgres e armazenamento de arquivos (S3/Blob).
- Front em produção apontando `REACT_APP_API_URL` para essa API para ter matches reais por similaridade facial.

### 3.2 Autenticação e papéis (opcional)

- Autenticação simples (ex.: API key para “operador” ou login básico) para proteger POST de registro e de sighting; auditoria de quem cadastrou o quê (útil para discussão de ética no TCC).

### 3.3 Export e relatórios

- Export de lista de missing persons ou de matches (CSV/PDF) para uso por autoridades ou relatório no TCC.

### 3.4 Internacionalização (i18n)

- Textos em português e inglês (ex.: react-i18next) se o projeto for mostrado em contextos internacionais.

---

## 4. Ética e TCC

- **Já feito:** aviso de privacidade/ética, referência ao International Missing Persons Wiki, ARCHITECTURE com seção de ética.
- **Pode adicionar:** uma página “Ética e uso” (ou seção no rodapé) com resumo: consentimento, revisão humana, minimização de dados, viés (NIST/FRVT), retenção e direito ao apagamento. Reforça a discussão no texto do TCC.

---

## 5. Resumo prático

| Fazer agora (recomendado) | Depois |
|---------------------------|--------|
| Front chamar `/api` (registro, sighting, matches) | Backend Python em produção (faces) |
| Loading e mensagens de erro no front | Página de lista de missing persons |
| `docs/DEPLOY.md` com passos Vercel | Filtros/ordenação em Matches |
| (Opcional) 1–2 testes front ou back | Auth, export, i18n, página “Ética e uso” |

Se quiser, posso implementar em seguida: **(1) conexão do front com a API** e **(2) `docs/DEPLOY.md`** (e, se você disser qual prioridade, os itens de “Fazer agora” ou “Depois”).
