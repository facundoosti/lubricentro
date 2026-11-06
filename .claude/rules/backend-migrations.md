---
paths:
  - "backend/db/**"
  - "backend/app/models/**/*.rb"
---

# Base de datos y migraciones

- **Nunca** edites `db/schema.rb` (hay un hook que lo bloquea). Generá una migración: `bin/rails g migration NombreDescriptivo`.
- Toda migración debe ser reversible (`change` o `up`/`down`).
- Agregá índices para foreign keys y columnas usadas en filtros/búsquedas.
- Columnas `null: false` en tablas con datos necesitan default o backfill en la misma migración.
- La DB es PostgreSQL con `pgvector` (embeddings); no uses SQL específico de SQLite.
- Los bloques de anotación de los modelos los genera `annotate`: no los edites a mano.
- Correr `db:migrate` requiere confirmación del usuario; `db:drop`/`db:reset` están prohibidos para Claude.
