# 📊 DIAGRAMA VISUAL DE TESTES

## Estrutura dos 149 Testes

```
AUTENTICAÇÃO COMPLETA
│
├─ 1. CADASTRO (20 testes)
│  ├─ Sucesso (4)
│  │  ├─ Dados válidos
│  │  ├─ Email normalizado
│  │  ├─ Role MEMBRO padrão
│  │  └─ Session criada
│  │
│  ├─ Validação (7)
│  │  ├─ Email inválido
│  │  ├─ Email vazio
│  │  ├─ Senha fraca
│  │  ├─ Senha sem maiúscula
│  │  ├─ Senha sem minúscula
│  │  ├─ Senha sem números
│  │  └─ Nome vazio
│  │
│  ├─ Duplicação (2)
│  │  ├─ Email já existente
│  │  └─ Email duplicado após 5 min
│  │
│  └─ Edge Cases (7)
│     ├─ Email com espaços
│     ├─ Nome com caracteres especiais
│     ├─ Sem Content-Type
│     └─ JSON inválido
│
├─ 2. LOGIN (25 testes)
│  ├─ Sucesso (6)
│  │  ├─ Email/senha corretos
│  │  ├─ Access token válido
│  │  ├─ Expiração 24h
│  │  ├─ Refresh em httpOnly cookie
│  │  ├─ Session criada
│  │  └─ Contador resetado
│  │
│  ├─ Falha (3)
│  │  ├─ Email correto, senha errada
│  │  ├─ Email errado, senha certa
│  │  └─ Ambos errados
│  │
│  ├─ Rate Limiting (4)
│  │  ├─ 5 tentativas bloqueiam
│  │  ├─ Bloqueio por 15 min
│  │  ├─ Desbloqueio automático
│  │  └─ 6ª tentativa ainda bloqueada
│  │
│  ├─ Validação (4)
│  │  ├─ Email vazio
│  │  ├─ Senha vazia
│  │  ├─ Email inválido
│  │  └─ Ambos vazios
│  │
│  └─ Email Verification (8)
│     └─ Login sem email verificado
│
├─ 3. LOGOUT (11 testes)
│  ├─ Sucesso (4)
│  │  ├─ JWT válido
│  │  ├─ Session marcada inativa
│  │  ├─ Refresh token deletado
│  │  └─ Múltiplas sessions
│  │
│  ├─ Sem Autenticação (3)
│  │  ├─ Sem JWT
│  │  ├─ JWT inválido
│  │  └─ JWT expirado
│  │
│  └─ Edge Cases (4)
│     ├─ Double logout
│     └─ Logout após deletar user
│
├─ 4. JWT ACCESS TOKEN (16 testes)
│  ├─ Estrutura (7)
│  │  ├─ 3 partes separadas por ponto
│  │  ├─ Header alg/typ
│  │  ├─ Payload sub (user_id)
│  │  ├─ Payload role
│  │  ├─ Payload email
│  │  ├─ Payload iat
│  │  └─ Payload exp (24h)
│  │
│  ├─ Assinatura (3)
│  │  ├─ Token decodificável
│  │  ├─ Token não alterável
│  │  └─ Assinatura HS256 válida
│  │
│  ├─ Expiração (3)
│  │  ├─ Token expirado rejeitado
│  │  ├─ Token com 23h59min aceito
│  │  └─ Token com exp agora rejeitado
│  │
│  ├─ Validação (4)
│  │  ├─ Token vazio rejeitado
│  │  ├─ Token malformado rejeitado
│  │  ├─ Caracteres inválidos rejeitados
│  │  └─ Chave errada rejeitada
│  │
│  └─ Armazenamento (2)
│     ├─ Access token no body
│     └─ NÃO é HttpOnly
│
├─ 5. REFRESH TOKEN (16 testes)
│  ├─ Sucesso (4)
│  │  ├─ Token válido renovado
│  │  ├─ Novo access token 24h
│  │  ├─ Novo refresh em cookie
│  │  └─ last_activity atualizado
│  │
│  ├─ Falha (4)
│  │  ├─ Token inválido
│  │  ├─ Token expirado
│  │  ├─ Token faltando no cookie
│  │  └─ Session inativa
│  │
│  ├─ Segurança (4)
│  │  ├─ IP diferente (log)
│  │  ├─ User-Agent diferente
│  │  ├─ Múltiplos refreshs sucessivos
│  │  └─ Refresh token reusado
│  │
│  └─ Edge Cases (4)
│     ├─ Refresh após logout
│     └─ Refresh com usuário deletado
│
├─ 6. RECUPERAÇÃO SENHA (23 testes)
│  ├─ Forgot - Sucesso (4)
│  │  ├─ Token gerado
│  │  ├─ Expiração 1h
│  │  ├─ Email "enviado"
│  │  └─ Não expõe se existe
│  │
│  ├─ Forgot - Validação (3)
│  │  ├─ Email vazio
│  │  ├─ Email inválido
│  │  └─ Email não existente
│  │
│  ├─ Reset - Sucesso (4)
│  │  ├─ Senha alterada
│  │  ├─ Senha antiga não funciona
│  │  ├─ Login com nova senha
│  │  └─ Todas sessions invalidadas
│  │
│  ├─ Reset - Falha (5)
│  │  ├─ Token inválido
│  │  ├─ Token expirado
│  │  ├─ Token vazio
│  │  ├─ Senha inválida
│  │  └─ Mesma senha anterior
│  │
│  └─ Edge Cases (7)
│     ├─ Múltiplos resets
│     ├─ Reset após 59 min
│     ├─ Reset após 1h1min
│     └─ Change password com reset pendente
│
├─ 7. PERMISSÕES (9 testes)
│  ├─ Roles (3)
│  │  ├─ SUPER_ADMIN tudo
│  │  ├─ ADMIN parcial
│  │  └─ MEMBRO limitado
│  │
│  ├─ Authorization (3)
│  │  ├─ MEMBRO acessa admin
│  │  ├─ ADMIN deleta usuário
│  │  └─ Sem permissão edita CMS
│  │
│  └─ Hierarquia (3)
│     ├─ SUPER_ADMIN > ADMIN
│     └─ Permissão específica
│
├─ 8. MIDDLEWARE (8 testes)
│  ├─ Authentication (5)
│  │  ├─ JWT válido passa
│  │  ├─ JWT inválido bloqueado
│  │  ├─ JWT expirado tenta refresh
│  │  ├─ Sem JWT bloqueado
│  │  └─ JWT do header
│  │
│  ├─ Authorization (2)
│  │  ├─ Middleware verifica role
│  │  └─ Chain de middlewares
│  │
│  └─ Enriquecimento (1)
│     ├─ req.user preenchido
│     └─ req.session preenchido
│
├─ 9. PROTEÇÃO DE ROTAS (14 testes)
│  ├─ Public Routes (3)
│  │  ├─ GET / sem JWT
│  │  ├─ POST /register sem JWT
│  │  └─ POST /login sem JWT
│  │
│  ├─ Protected Routes (4)
│  │  ├─ GET /profile sem JWT
│  │  ├─ GET /profile com JWT
│  │  ├─ POST /logout sem JWT
│  │  └─ POST /logout com JWT
│  │
│  ├─ Admin Routes (4)
│  │  ├─ MEMBRO acessa /admin
│  │  ├─ ADMIN acessa /admin/cms
│  │  ├─ SUPER_ADMIN acessa /admin/users
│  │  └─ ADMIN acessa /admin/users
│  │
│  ├─ Resource-Based (3)
│  │  ├─ Usuário A vs Usuário B
│  │  ├─ Usuário acessa seus dados
│  │  └─ ADMIN acessa dados
│  │
│  └─ CORS (2)
│     ├─ Requisição CORS
│     └─ Preflight OPTIONS
│
└─ 10. SEGURANÇA (7 testes)
   ├─ Ataques (4)
   │  ├─ SQL Injection
   │  ├─ XSS
   │  ├─ CSRF
   │  └─ Brute Force
   │
   └─ Dados Sensíveis (3)
      ├─ Senha não retornada
      ├─ JWT não contém senha
      └─ Refresh em httpOnly
```

## Fluxo de Teste Recomendado

```
START
  │
  ├─→ [1] CADASTRO (20)  ✓ Base do sistema
  │         │
  │         └─→ [2] LOGIN (25)  ✓ Autenticação
  │                   │
  │                   ├─→ [4] JWT (16)  ✓ Validação token
  │                   │     │
  │                   │     └─→ [5] REFRESH (16)  ✓ Renovação
  │                   │
  │                   └─→ [3] LOGOUT (11)  ✓ Encerramento
  │
  ├─→ [6] REC. SENHA (23)  ✓ Reset
  │
  ├─→ [7] PERMISSÕES (9)  ✓ Autorização
  │
  ├─→ [8] MIDDLEWARE (8)  ✓ Fluxo
  │
  ├─→ [9] ROTAS (14)  ✓ Segurança
  │
  ├─→ [10] SEGURANÇA (7)  ✓ Edge cases
  │
  └─→ FINAL
      Status: ✅ APROVADO ou ❌ COM ISSUES
```

## Matriz de Testes

```
┌─────────────────────┬──────────┬──────────────────────────┐
│ Categoria           │ Total    │ Tempo Estimado           │
├─────────────────────┼──────────┼──────────────────────────┤
│ 1. Cadastro         │ 20       │ ~15 min                  │
│ 2. Login            │ 25       │ ~20 min                  │
│ 3. Logout           │ 11       │ ~8 min                   │
│ 4. JWT              │ 16       │ ~10 min                  │
│ 5. Refresh          │ 16       │ ~10 min                  │
│ 6. Recuperação      │ 23       │ ~20 min                  │
│ 7. Permissões       │ 9        │ ~8 min                   │
│ 8. Middleware       │ 8        │ ~6 min                   │
│ 9. Rotas            │ 14       │ ~10 min                  │
│ 10. Segurança       │ 7        │ ~5 min                   │
├─────────────────────┼──────────┼──────────────────────────┤
│ TOTAL               │ 149      │ ~2 horas                 │
└─────────────────────┴──────────┴──────────────────────────┘
```

## Checklist de Execução

```
ANTES:
[ ] .env.local configurado
[ ] Banco resetado
[ ] Dev server rodando
[ ] PostMan pronto
[ ] JWT.io aberto
[ ] Dados de teste memorizados

TC-1.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-2.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-3.x:   [ ] [ ] [ ] [ ] [ ]
TC-4.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-5.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-6.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-7.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-8.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-9.x:   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
TC-10.x:  [ ] [ ] [ ] [ ] [ ] [ ] [ ]

FINAL:
[ ] Todos os 149 testes executados
[ ] Documentação de issues (se houver)
[ ] Pronto para ETAPA 3
```

## Status Atual

```
┌──────────────────────────────────────┐
│  ETAPA 1: BANCO                 ✅   │
│  ETAPA 2: AUTENTICAÇÃO          ✅   │
│  ETAPA 2: DOCUMENTAÇÃO TESTES   ✅   │
│  ETAPA 2: EXECUTAR TESTES       ⏳   │
│  ETAPA 3: CMS                   ⏳   │
└──────────────────────────────────────┘
```

**AGUARDANDO: Execução dos 149 testes** 🧪
