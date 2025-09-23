#!/bin/bash

# Script para testar as rotas do sistema de famílias
BASE_URL="http://localhost:3001"

echo "=== Testando Sistema de Famílias ==="
echo ""

# Testar Health Check
echo "1. Health Check:"
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""

# Testar rota de famílias sem autenticação (deve dar erro 401)
echo "2. Listar famílias sem autenticação (esperado: erro 401):"
curl -s -X GET "$BASE_URL/families" | head -c 200
echo ""
echo ""

# Testar com header de congregação mas sem auth (deve dar erro 401)
echo "3. Listar famílias com congregação mas sem auth (esperado: erro 401):"
curl -s -X GET "$BASE_URL/families" \
  -H "x-congregacao-id: 550e8400-e29b-41d4-a716-446655440000" | head -c 200
echo ""
echo ""

# Verificar estrutura do banco - famílias existentes
echo "4. Verificando estrutura do banco SQLite:"
echo "Tabelas disponíveis:"
sqlite3 dev.sqlite ".tables"
echo ""

echo "Estrutura da tabela familias:"
sqlite3 dev.sqlite ".schema familias"
echo ""

echo "Famílias existentes no banco:"
sqlite3 dev.sqlite "SELECT familia_id, nome_familia, cidade, ativo FROM familias LIMIT 5;"
echo ""

echo "Congregações existentes:"
sqlite3 dev.sqlite "SELECT congregacao_id, nome FROM congregacoes LIMIT 3;"
echo ""

echo "=== Teste das Rotas Concluído ==="