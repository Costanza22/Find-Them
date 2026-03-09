# Deploy do FindThem na Vercel

Este guia permite à banca (ou qualquer avaliador) reproduzir o deploy do FindThem na Vercel, com banco Postgres e armazenamento de arquivos (Blob) no mesmo projeto.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com) (gratuita).
- Repositório do projeto no GitHub: `https://github.com/Costanza22/Find-Them` (ou fork).

## 1. Importar o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **Add New…** → **Project**.
3. Em **Import Git Repository**, selecione o repositório **Find-Them** (ou conecte o GitHub se ainda não estiver conectado).
4. Confirme:
   - **Framework Preset**: Other (o projeto usa Create React App no subdiretório `front-end` e API serverless em `api/`).
   - **Root Directory**: deixe em branco (raiz do repositório).
   - **Build and Output Settings** já estão definidos no `vercel.json` do repositório:
     - Install: `npm ci && cd front-end && npm ci`
     - Build: `cd front-end && npm run build`
     - Output: `front-end/build`
5. **Não** faça deploy ainda; clique em **Cancel** ou volte. Primeiro vamos adicionar Postgres e Blob.

## 2. Adicionar Vercel Postgres

1. No dashboard do projeto (ou na lista de projetos), abra o projeto **Find-Them**.
2. Vá na aba **Storage**.
3. Clique em **Create Database** → **Postgres**.
4. Dê um nome (ex.: `findthem-db`) e escolha a região (ex.: Washington, D.C.).
5. Clique em **Create**. A Vercel cria o banco e **associa automaticamente** as variáveis de ambiente (`POSTGRES_URL`, etc.) ao projeto. Não é necessário copiar variáveis manualmente.

## 3. Adicionar Vercel Blob

1. Na mesma aba **Storage** do projeto.
2. Clique em **Create Database** (ou **Create Store**) → **Blob** (ou **Blob Store**).
3. Nome (ex.: `findthem-blob`) e região se solicitado.
4. Clique em **Create**. A Vercel associa as variáveis do Blob (ex.: `BLOB_READ_WRITE_TOKEN`) ao projeto.

## 4. Variáveis de ambiente (opcional)

- **Postgres e Blob**: se você seguiu os passos 2 e 3, as variáveis já estão ligadas ao projeto. Não é necessário definir `REACT_APP_API_URL` para produção se o front e a API estiverem no mesmo domínio: o front usa URLs relativas (`/api/...`).
- Se o front for servido em outro domínio (ex.: outro deploy), defina no projeto Vercel:
  - `REACT_APP_API_URL` = `https://seu-dominio.vercel.app` (com barra no final ou sem, conforme o `api/client.js`).

## 5. Fazer o deploy

1. Aba **Deployments** do projeto.
2. Se o primeiro deploy já tiver sido feito sem Postgres/Blob, clique nos três pontinhos do último deployment → **Redeploy** (ou faça um novo commit e push para disparar um novo deploy).
3. Aguarde o build terminar. O build instala dependências da raiz (para a API) e do `front-end`, gera o `front-end/build` e publica as funções em `api/` em `/api/*`.

## 6. Verificação rápida

- **Front**: abra a URL do projeto (ex.: `https://find-them-xxx.vercel.app`). Deve carregar a interface (Home, Register, Registry, Report Sighting, Matches).
- **API**:
  - `GET https://seu-projeto.vercel.app/api/missing-persons` → deve retornar `[]` ou lista de pessoas (status 200).
  - Registrar uma pessoa (Register) com nome e foto; depois abrir **Registry** e conferir se o caso aparece.
  - Enviar um sighting (Report Sighting) com foto; depois **Matches** (a lista pode estar vazia se não houver pipeline de reconhecimento facial no backend serverless).

## Resumo para a banca

| Passo | Ação |
|-------|------|
| 1 | Importar repositório GitHub na Vercel como novo projeto. |
| 2 | Storage → Create Database → **Postgres** (nome e região). |
| 3 | Storage → Create → **Blob** (nome e região). |
| 4 | (Opcional) Definir `REACT_APP_API_URL` só se o front rodar em outro domínio. |
| 5 | Deploy (automático após import ou Redeploy após adicionar Postgres/Blob). |
| 6 | Testar a URL do projeto e `/api/missing-persons`. |

O backend Python (FastAPI com InsightFace/FAISS) descrito no `ARCHITECTURE.md` não está incluído neste deploy; a API na Vercel é a serverless em Node.js em `api/`, com Postgres e Blob. Os matches exibidos na interface dependem de dados inseridos manualmente ou de um processo externo que popule a tabela `matches`.
