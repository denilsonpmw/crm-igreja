#!/bin/bash

echo "🚀 Testando endpoints do CRM-ADPS..."
echo ""

# Aguardar o servidor estar disponível
echo "Aguardando servidor na porta 3001..."
timeout 30s bash -c 'until nc -z localhost 3001; do sleep 1; done' 2>/dev/null || {
  echo "❌ Servidor não está rodando na porta 3001"
  echo "Execute: npm run dev"
  exit 1
}

echo "✅ Servidor encontrado!"
echo ""

# Teste 1: Registro de usuário
echo "📝 Testando registro de usuário..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste Usuario","email":"teste@exemplo.com","senha":"123456"}')

echo "Resposta do registro: $REGISTER_RESPONSE"
echo ""

# Teste 2: Login
echo "🔑 Testando login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","senha":"123456"}')

echo "Resposta do login: $LOGIN_RESPONSE"
echo ""

# Teste 3: Listar membros
echo "👥 Testando listagem de membros..."
MEMBERS_RESPONSE=$(curl -s -X GET http://localhost:3001/members)

echo "Resposta dos membros: $MEMBERS_RESPONSE"
echo ""

# Teste 4: Criar membro
echo "➕ Testando criação de membro..."
CREATE_MEMBER_RESPONSE=$(curl -s -X POST http://localhost:3001/members \
  -H "Content-Type: application/json" \
  -d '{"nome":"João da Silva","cpf":"123.456.789-00","telefone":"(11) 99999-9999"}')

echo "Resposta da criação: $CREATE_MEMBER_RESPONSE"
echo ""

echo "✅ Testes concluídos!"