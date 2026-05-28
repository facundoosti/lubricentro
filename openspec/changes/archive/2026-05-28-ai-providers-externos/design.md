## Context

El backend Rails usa dos servicios de IA:

- `AiAgentService`: cliente de chat con tool calling, actualmente apunta a LM Studio (`AI_API_URL` + `AI_API_KEY`)
- `EmbeddingService`: genera vectores para búsqueda semántica en catálogo, mismo `AI_API_URL` + `AI_API_KEY`

Ambos usan la gem `ruby-openai` con endpoint configurable. El código ya es provider-agnóstico — solo requieren una URL OpenAI-compatible y un API key. El problema es que embeddings y chat necesitan proveedores distintos en producción, pero hoy comparten las mismas variables de entorno.

En local se usa LM Studio con `nomic-embed-text-v1.5` (768 dim) para embeddings y Gemma 4 26B para chat. La base de datos en producción usa pgvector con vectores de 768 dimensiones.

## Goals / Non-Goals

**Goals:**
- Habilitar embeddings en producción usando Nomic AI API (mismo modelo, cero reindexación)
- Habilitar el agente de chat en producción usando Groq API (tool calling, baja latencia)
- Separar las variables de entorno de embeddings vs. chat para permitir proveedores distintos
- Sin cambios en comportamiento visible al usuario ni en la API pública

**Non-Goals:**
- Cambio de modelo de embeddings (se mantiene `nomic-embed-text-v1.5` para preservar compatibilidad)
- Fallback automático entre proveedores
- Rate limiting o circuit breaker sobre providers externos
- Soporte multi-tenant (múltiples lubricentros con distintos providers)

## Decisions

### 1. Separar variables de entorno de embeddings y chat

**Decisión**: Introducir `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` para `EmbeddingService`, manteniendo `AI_API_URL` y `AI_API_KEY` para `AiAgentService`.

**Alternativas consideradas**:
- _Un solo provider para todo_: Requeriría que el mismo proveedor tenga tanto embeddings como LLM con tool calling. Ningún proveedor gratuito lo cubre bien.
- _Variable `AI_PROVIDER` con lógica de switch_: Más complejo, no aporta valor hoy.

**Rationale**: La separación es mínima (un cliente distinto en `EmbeddingService`) y permite elegir el proveedor óptimo para cada tarea sin acoplar los servicios.

---

### 2. Groq para el LLM de chat

**Decisión**: `llama-3.3-70b-versatile` en Groq como provider de chat en producción.

**Alternativas consideradas**:
- _OpenRouter_: Más opciones de modelos, pero latencia variable y free tier más restrictivo.
- _Gemini API (Google AI Studio)_: Free tier generoso, pero herramienta/tool calling menos estable.
- _Together AI_: Buena velocidad, pero tier gratuito limitado.

**Rationale**: Groq tiene la menor latencia del mercado (~0.5s), tool calling sólido en Llama 3.3, y 1000 requests/día gratis que son suficientes para un lubricentro.

Endpoint compatible: `https://api.groq.com/openai/v1`

---

### 3. Jina AI API para embeddings

**Decisión**: `jina-embeddings-v3` con `dimensions: 768` vía `https://api.jina.ai/v1`.

**Alternativas consideradas**:
- _Nomic AI_: El modelo es idéntico al usado en local, pero su API no es OpenAI-compatible (usa `/embedding/text` en vez de `/embeddings`) — incompatible con el cliente `ruby-openai` sin modificaciones.
- _Together AI embeddings_: Modelo diferente, free tier más acotado.
- _Ollama en Railway solo para embeddings_: Viable pero agrega ~$10/mes de infra innecesaria.

**Rationale**: Jina AI tiene endpoint OpenAI-compatible (`/v1/embeddings`), free tier de ~1M tokens/mes, y soporta `dimensions: 768` explícitamente. Compatible sin ningún cambio en el cliente. Validado localmente: retorna arrays de 768 floats correctamente.

---

### 4. No cambiar la interfaz de los servicios

**Decisión**: `EmbeddingService.generate(text)` y `AiAgentService#process(message)` mantienen su firma actual.

**Rationale**: El cambio es puramente de infraestructura (qué cliente HTTP se instancia). Las capas superiores (jobs, controllers) no se tocan.

## Risks / Trade-offs

- **Dependencia de dos providers externos** → Mitigation: ambos tienen free tier con SLA razonable; si uno falla, el sistema degrada gracefully (el agente retorna mensaje de error ya manejado en el rescue).
- **Rate limits en Groq (1000 req/día en free tier)** → Mitigation: para un único lubricentro en producción inicial es más que suficiente; si se escala, el upgrade cuesta ~$0.59/M tokens.
- **Nomic AI puede cambiar su API** → Mitigation: el modelo `nomic-embed-text` también está disponible en Ollama y otros providers; la separación de variables facilita migrar solo el provider de embeddings sin tocar el de chat.
- **Latencia de red en Railway → Groq/Nomic** → Mitigation: Groq tiene datacenter en US-East, latencia esperada desde Railway ~100-200ms adicionales. Aceptable para WhatsApp (asíncrono).

## Migration Plan

1. Obtener API keys: crear cuenta en [console.groq.com](https://console.groq.com) y [atlas.nomic.ai](https://atlas.nomic.ai)
2. Probar localmente cambiando `.env` con las nuevas variables
3. Configurar variables en Railway (backend service environment)
4. Deploy — sin migración de datos, sin downtime
5. Verificar: enviar mensaje de prueba vía WhatsApp y consultar precios para confirmar embeddings

**Rollback**: revertir las variables de entorno en Railway a los valores anteriores. No hay cambios en BD.

## Open Questions

- ¿El modelo `llama-3.3-70b-versatile` de Groq tiene suficiente calidad para las herramientas (`check_available_slots`, `schedule_appointment`, `classify_intent`)? → Validar con prueba de integración antes de go-live.
- ¿Se quiere agregar logs de latencia por provider para monitorear en producción?
