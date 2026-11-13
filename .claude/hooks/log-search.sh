#!/usr/bin/env bash
# PreToolUse (Grep|Glob|Bash|mcp__codegraph__*): registra qué herramienta de búsqueda usa el agente
# en .claude/logs/search-usage.jsonl (git-ignored). Nunca bloquea: ante cualquier error sale 0.
# Reporte: .claude/scripts/search-report.sh
set -uo pipefail

input=$(cat) || exit 0
tool=$(jq -r '.tool_name // empty' <<<"$input" 2>/dev/null) || exit 0

kind=""
detail=""
case "$tool" in
  mcp__codegraph__*) kind="codegraph"; detail="${tool#mcp__codegraph__}" ;;
  Grep) kind="grep"; detail="Grep" ;;
  Glob) kind="glob"; detail="Glob" ;;
  Bash)
    cmd=$(jq -r '.tool_input.command // empty' <<<"$input" 2>/dev/null)
    if grep -Eq '(^|[;&|(][[:space:]]*|&&[[:space:]]*)codegraph[[:space:]]' <<<"$cmd"; then
      kind="codegraph"; detail="cli:$(grep -Eo 'codegraph[[:space:]]+[a-z]+' <<<"$cmd" | head -1 | awk '{print $2}')"
    # grep/rg/find como comando principal (no como filtro tras un pipe)
    elif grep -Eq '(^|;|&&)[[:space:]]*(cd [^;&]+&&[[:space:]]*)?(grep|rg|find|ag)[[:space:]]' <<<"$cmd"; then
      kind="grep"; detail="bash:$(grep -Eo '(^|;|&&)[[:space:]]*(grep|rg|find|ag)[[:space:]]' <<<"$cmd" | head -1 | tr -d ';& \t')"
    fi
    ;;
esac

[[ -z "$kind" ]] && exit 0

dir="${CLAUDE_PROJECT_DIR:-.}/.claude/logs"
mkdir -p "$dir" 2>/dev/null || exit 0
jq -cn \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg kind "$kind" \
  --arg detail "$detail" \
  --argjson in "$input" \
  '{ts:$ts, kind:$kind, detail:$detail, session:($in.session_id // ""), agent:($in.agent_type // $in.agent_id // "main")}' \
  >>"$dir/search-usage.jsonl" 2>/dev/null

exit 0
