## 1. EmbeddingService — separar variables de entorno

- [x] 1.1 En `app/services/embedding_service.rb`, cambiar el método `client` para usar `ENV.fetch("AI_EMBEDDING_URL")` y `ENV.fetch("AI_EMBEDDING_KEY")` en lugar de `AI_API_URL` y `AI_API_KEY`
- [x] 1.2 Actualizar el spec `spec/services/embedding_service_spec.rb` para hacer stub de las nuevas variables de entorno (`AI_EMBEDDING_URL`, `AI_EMBEDDING_KEY`) — también ajustado el before global del spec

## 2. Configuración de variables de entorno

- [x] 2.1 Actualizar `.env.example`: agregar `AI_EMBEDDING_URL`, `AI_EMBEDDING_KEY`, `AI_EMBEDDING_DIMENSION` con comentarios que indiquen el proveedor sugerido (Nomic AI) y URL base (`https://api-atlas.nomic.ai/v1`)
- [x] 2.2 Actualizar `.env.example`: agregar comentario sobre Groq en `AI_API_URL` y `AI_API_KEY` con URL base (`https://api.groq.com/openai/v1`) y modelo sugerido (`llama-3.3-70b-versatile`)
- [x] 2.3 Actualizar `docker-compose.yml`: agregar `AI_EMBEDDING_URL` y `AI_EMBEDDING_KEY` en los servicios `backend` y `worker`

## 3. Verificación local con providers externos

- [x] 3.1 Crear cuenta en [console.groq.com](https://console.groq.com) y obtener API key
- [x] 3.2 Crear cuenta en [atlas.nomic.ai](https://atlas.nomic.ai) y obtener API key
- [x] 3.3 Configurar `.env` local con las nuevas variables apuntando a Groq y Nomic AI
- [x] 3.4 Ejecutar `bundle exec rspec spec/services/embedding_service_spec.rb` y `bundle exec rspec spec/services/ai_agent_service_spec.rb` — todos deben pasar
- [x] 3.5 Verificar manualmente en consola Rails: `EmbeddingService.generate("aceite motor")` debe retornar array de 768 floats
- [x] 3.6 Verificar manualmente en consola Rails: enviar un mensaje de prueba a `AiAgentService` con tool calling

## 4. Configuración en Railway (producción)

- [x] 4.1 En Railway → backend service → Variables, agregar: `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_EMBEDDING_URL`, `AI_EMBEDDING_KEY`, `AI_MODEL_EMBEDDING`, `AI_EMBEDDING_DIMENSION`
- [x] 4.2 Hacer redeploy del servicio backend en Railway y verificar que arranca sin errores de `KeyError`
- [ ] 4.3 Ejecutar `EmbeddingService.reindex_catalog!` en la consola de Railway para regenerar embeddings del catálogo con el nuevo provider (solo si hay datos en producción)
