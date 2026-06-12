#!/bin/bash

# Build script para Vercel - garante que Prisma é gerado corretamente

# 1. Verificar se DATABASE_URL existe, se não, usar dummy
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dummy:dummy@localhost/dummy"
  echo "DATABASE_URL não configurado, usando dummy para build..."
fi

# 2. Gerar Prisma client
echo "Gerando Prisma client..."
npx prisma generate

# 3. Rodar build do Next.js
echo "Buildando Next.js..."
next build
