#!/usr/bin/env bash
# SessionStart: refresca el índice de codegraph y muestra los changes de OpenSpec activos.
# Lo que se imprime en stdout entra como contexto de la sesión.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

command -v codegraph >/dev/null && codegraph sync --quiet >/dev/null 2>&1

echo "## Estado del repo"
echo "- Rama: $(git branch --show-current 2>/dev/null)"
if command -v openspec >/dev/null; then
  active=$(find openspec/changes -mindepth 1 -maxdepth 1 -type d ! -name archive 2>/dev/null | xargs -n1 basename 2>/dev/null)
  if [[ -n "$active" ]]; then
    echo "- Changes de OpenSpec activos: $(echo "$active" | tr '\n' ' ')"
    echo "  Antes de implementar, leé su tasks.md y usá /openspec-apply-change."
  else
    echo "- Sin changes de OpenSpec activos. Para features nuevas, empezá con /openspec-propose."
  fi
fi
exit 0
