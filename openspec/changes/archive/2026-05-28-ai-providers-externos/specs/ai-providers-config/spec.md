## ADDED Requirements

### Requirement: EmbeddingService usa variables de entorno independientes del LLM de chat
El sistema SHALL configurar `EmbeddingService` con `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` como variables de entorno separadas de las usadas por `AiAgentService` (`AI_API_URL`, `AI_API_KEY`).

#### Scenario: Generación de embedding con provider configurado
- **WHEN** se llama a `EmbeddingService.generate(text)` con `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` configurados
- **THEN** el servicio realiza la solicitud al endpoint `AI_EMBEDDING_URL` usando `AI_EMBEDDING_KEY` como token de autenticación

#### Scenario: Variables de embeddings ausentes
- **WHEN** `AI_EMBEDDING_URL` o `AI_EMBEDDING_KEY` no están definidas en el entorno
- **THEN** la aplicación lanza `KeyError` al iniciar (comportamiento de `ENV.fetch` sin valor por defecto)

---

### Requirement: AiAgentService mantiene sus variables de entorno propias
El sistema SHALL que `AiAgentService` use `AI_API_URL` y `AI_API_KEY` sin depender de las variables de embeddings.

#### Scenario: Chat con provider configurado
- **WHEN** se llama a `AiAgentService#process(message)` con `AI_API_URL` y `AI_API_KEY` configurados
- **THEN** el servicio envía la solicitud al endpoint `AI_API_URL` usando `AI_API_KEY` como token

---

### Requirement: Compatibilidad de embeddings existentes
El sistema SHALL generar embeddings de 768 dimensiones con el modelo `nomic-embed-text-v1.5` para mantener compatibilidad con los vectores ya almacenados en la base de datos.

#### Scenario: Dimensión de vector consistente
- **WHEN** `EmbeddingService.generate(text)` se invoca en producción con Nomic AI como provider
- **THEN** retorna un array de 768 floats (igual que con LM Studio local)

#### Scenario: Búsqueda semántica funciona con embeddings generados en producción
- **WHEN** un mensaje de WhatsApp dispara `ContextRetrievalService.call(query)`
- **THEN** los productos y servicios retornados tienen `neighbor_distance < 0.4` usando los embeddings almacenados

---

### Requirement: Variables documentadas en .env.example
El sistema SHALL documentar todas las variables de entorno de IA en `.env.example` incluyendo proveedor sugerido, URL base y descripción.

#### Scenario: Desarrollador configura entorno desde cero
- **WHEN** un desarrollador copia `.env.example` a `.env`
- **THEN** puede identificar qué valor colocar en cada variable de IA leyendo los comentarios del archivo

---

### Requirement: docker-compose.yml incluye variables de embeddings
El sistema SHALL incluir `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` en los servicios `backend` y `worker` del `docker-compose.yml`.

#### Scenario: Worker genera embeddings al procesar GenerateEmbeddingJob
- **WHEN** `GenerateEmbeddingJob` se ejecuta en el worker de Solid Queue
- **THEN** el worker tiene acceso a `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` para llamar a `EmbeddingService`
