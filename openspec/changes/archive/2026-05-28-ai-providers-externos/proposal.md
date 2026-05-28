## Why

El sistema de IA (agente de WhatsApp y búsqueda semántica de catálogo) necesita proveedores de LLM y embeddings configurados para producción. Hoy solo funciona en local con LM Studio, lo que bloquea el deploy del agente de WhatsApp en Railway.

## What Changes

- Se reemplaza la dependencia de LM Studio local por dos proveedores cloud con free tier
- Se separan las variables de entorno de embeddings (`AI_EMBEDDING_URL`, `AI_EMBEDDING_KEY`) del LLM de chat (`AI_API_URL`, `AI_API_KEY`)
- `EmbeddingService` apunta a **Nomic AI API** (`nomic-embed-text-v1.5`, compatible con los embeddings ya generados localmente)
- `AiAgentService` apunta a **Groq API** (`llama-3.3-70b-versatile` con tool calling)
- Se actualiza `.env.example` con las nuevas variables
- Se documentan las variables de entorno necesarias en Railway

## Capabilities

### New Capabilities

- `ai-providers-config`: Configuración de proveedores externos de IA (Groq para chat, Nomic AI para embeddings) con variables de entorno separadas por función

### Modified Capabilities

<!-- Sin cambios de comportamiento visible al usuario. El cambio es solo de infraestructura de providers. -->

## Impact

- `app/services/ai_agent_service.rb` — usa nuevas env vars `AI_API_URL` / `AI_API_KEY`
- `app/services/embedding_service.rb` — usa nuevas env vars `AI_EMBEDDING_URL` / `AI_EMBEDDING_KEY`
- `docker-compose.yml` — agrega variables `AI_EMBEDDING_URL`, `AI_EMBEDDING_KEY`
- `.env.example` — documenta las nuevas variables y proveedores
- Railway — requiere configurar 4 variables de entorno nuevas en el servicio backend
- Sin cambios en la API pública ni en modelos de base de datos
- Los embeddings existentes siguen siendo compatibles (mismo modelo `nomic-embed-text-v1.5`, mismas 768 dimensiones)
