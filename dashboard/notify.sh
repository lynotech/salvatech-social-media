#!/bin/bash
# SalvaTech Dashboard — Notifier
# Uso: ./notify.sh <json>
#
# Exemplos:
#
# Iniciar pipeline:
#   ./notify.sh '{"pipeline":"running","tema":"5 sinais que seu sistema vai falhar","composicao":"Tipo A","log":"Ciclo iniciado","logType":"agent"}'
#
# Agente trabalhando:
#   ./notify.sh '{"step":1,"stepStatus":"active","agent":"estrategista","status":"working","message":"Pesquisando...","log":"Estrategista iniciou","logType":"agent"}'
#
# Agente concluiu:
#   ./notify.sh '{"step":1,"stepStatus":"done","agent":"estrategista","status":"done","message":"Brief pronto!","log":"Estrategista concluiu ✓","logType":"ok"}'
#
# Checkpoint:
#   ./notify.sh '{"step":2,"stepStatus":"waiting","pipeline":"checkpoint","agent":"orquestrador","status":"waiting","message":"Aguardando aprovação...","log":"Checkpoint: estrutura","logType":"warn"}'
#
# Pipeline concluído:
#   ./notify.sh '{"pipeline":"done","log":"Carrossel finalizado! 🎉","logType":"ok"}'
#
# Reset:
#   curl -X POST http://localhost:3737/api/reset

DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:3737}"

curl -s -X POST "$DASHBOARD_URL/api/status" \
  -H "Content-Type: application/json" \
  -d "$1" > /dev/null 2>&1
