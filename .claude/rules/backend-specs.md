---
paths:
  - "backend/spec/**/*.rb"
---

# Tests backend (RSpec)

- Endpoints se testean como **request specs** en `spec/requests/api/v1/<recurso>_spec.rb` (`type: :request`), no controller specs.
- Incluí `ApiHelper` (`spec/support/api_helper.rb`): usá `auth_headers(user)` para autenticar y `json_response` para parsear.
- Verificá siempre el contrato de respuesta: `success`, `data`/`errors`, `message` y `pagination` en listados.
- Cubrí por endpoint: caso feliz, sin auth (401), params inválidos (422) y recurso inexistente (404).
- Datos con FactoryBot (`spec/factories/`). Preferí `build`/`build_stubbed` cuando no hace falta persistir.
- Model specs: validaciones y asociaciones con shoulda-matchers; métodos públicos con ejemplos concretos.
- Service specs: `subject(:call) { described_class.new(...).call }`, un `context` por rama.
- Embeddings y LLM están mockeados globalmente (`spec/support/embedding_mocks.rb`); nunca llames APIs externas reales.
- Correr un archivo: `cd backend && bundle exec rspec spec/ruta/al_spec.rb`.
