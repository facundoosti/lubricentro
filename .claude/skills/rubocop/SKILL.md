---
name: rubocop
description: Corre RuboCop con auto-corrección (-A) sobre todo el backend y resume las ofensas que quedan.
disable-model-invocation: true
allowed-tools: Bash(bundle exec rubocop *)
---

Corré desde `backend/`:

```bash
cd "$CLAUDE_PROJECT_DIR/backend" && bundle exec rubocop -A
```

Después resumí: archivos corregidos y ofensas que no se pudieron auto-corregir (con `archivo:línea`). No corrijas a mano lo que quede sin preguntar.
