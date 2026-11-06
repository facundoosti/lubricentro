#!/usr/bin/env bash
# PreToolUse (Bash): cubre lo que las reglas deny de Read no ven (cat/grep sobre secretos, etc.).
set -euo pipefail

cmd=$(jq -r '.tool_input.command // empty')
[[ -z "$cmd" ]] && exit 0

# Lectura de secretos por shell (.env, .env.local, master.key). Permite .env.example.
if grep -Eq '(^|[[:space:]/"'"'"'])\.env(\.[A-Za-z0-9_-]+)?([[:space:]"'"'"';|&]|$)' <<<"$cmd" \
   && ! grep -Eq '\.env\.example' <<<"$cmd"; then
  echo "Bloqueado: el comando toca un archivo .env con secretos. Usá .env.example o pedile el valor al usuario." >&2
  exit 2
fi
if grep -Eq 'master\.key|credentials/[^ ]*\.key' <<<"$cmd"; then
  echo "Bloqueado: el comando toca credenciales de Rails." >&2
  exit 2
fi

# Commits/push directo a main.
# Se evalúa cada segmento (&&, ||, ;, |) por separado para no confundir con `gh pr create --base main`.
if sed -E 's/(&&|\|\||;|\|)/\n/g' <<<"$cmd" | grep -Eq '^[[:space:]]*git push( [^ ]+)* (origin )?(HEAD:)?main([[:space:]]|$)'; then
  echo "Bloqueado: no se pushea directo a main. Usá una rama y abrí un PR." >&2
  exit 2
fi

exit 0
