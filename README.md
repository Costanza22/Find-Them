# FindThem

Sistema assistido por IA para apoiar a identificação de pessoas desaparecidas usando reconhecimento facial e visão computacional.

- **Front-end:** React — registro de casos, envio de avistamentos, visualização de possíveis correspondências.
- **Back-end:** FastAPI (Python) — API REST, extração de embeddings faciais, busca por similaridade em base vetorial.

## Estrutura do repositório

| Pasta / arquivo | Descrição |
|-----------------|-----------|
| `front-end/` | Aplicação React (interface tipo arquivo de caso / boletim) |
| `backend/` | API FastAPI, modelos, pipeline de faces, vetores |
| `ARCHITECTURE.md` | Arquitetura do sistema, modelos, ética e privacidade |
| `docs/EXTERNAL_RESOURCES.md` | Recursos externos e referências (ex.: International Missing Persons Wiki) |

## Como rodar

- **Front-end:** `cd front-end && npm install && npm start`
- **Back-end:** `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`

Ver `front-end/README.md` e `backend/README.md` para detalhes.

## Recursos externos e referência

O [**International Missing Persons Wiki**](https://int-missing.fandom.com/wiki/International_Missing_Persons_Wiki) (Fandom) documenta casos de pessoas desaparecidas em nível internacional. O FindThem pode referenciá-lo para contexto e conscientização; integrações técnicas (ex.: importação de dados) devem respeitar os termos do site e a privacidade das famílias. Ver `docs/EXTERNAL_RESOURCES.md`.
