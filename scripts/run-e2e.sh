#!/usr/bin/env bash
# Sempre executa pytest a partir da raiz do repositório (evita falha ao rodar de tattooali/).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec python3 -m pytest tests/e2e "$@"
