# GUIA PRÁTICO DE EXECUÇÃO DOS TESTES

## Preparação do Ambiente

### 1. Verificar .env.local
```bash
# Confirmar que existem:
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=seu_secret_super_seguro
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
```

### 2. Resetar Banco de Dados
```bash
# Drop todas as tabelas
npx prisma migrate reset --force

# Recriar schema
npx prisma migrate dev

# Popular com dados iniciais
npx prisma db seed
```

### 3. Verificar Dados Iniciais
```bash
# Login de teste deve estar disponível:
Email: super@exemplo.com
Senha: SuperAdmin@123
Role: SUPER_ADMIN

Email: admin@exemplo.com
Senha: Admin@123
Role: ADMIN

Email: membro@exemplo.com
Senha: Membro@123
Role: MEMBRO
```

### 4. Iniciar Dev Server
```bash
npm run dev
# Server rodando em http://localhost:3000
```

---

## Ferramentas Necessárias

### PostMan / Insomnia
1. Criar nova coleção "COMUNIDADE_RP"
2. Criar 10 pastas (uma para cada seção)
3. Adicionar endpoints conforme listado abaixo

### MySQL Client
- phpMyAdmin / MySQL Workbench / DBeaver
- Conectar ao banco de testes
- Ter acesso para verificar dados

### JWT Decoder
- https://jwt.io/
- Copiar token gerado
- Colar no field para decodificar e verificar payload

---

## TESTE 1: CADASTRO (Register)

### TC-1.1.1: Cadastro com dados válidos
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha@123"
}
```
**Esperado:**
- Status: 201
- Response: `{ "user": {...}, "accessToken": "eyJ..." }`
- Verificar banco: usuário criado com role MEMBRO

### TC-1.2.1: Email inválido
```json
POST /api/auth/register
{
  "name": "João",
  "email": "invalido",
  "password": "Senha@123"
}
```
**Esperado:**
- Status: 400
- Response: `{ "error": "INVALID_EMAIL" }`

### TC-1.2.3: Senha fraca
```json
POST /api/auth/register
{
  "name": "João",
  "email": "joao@exemplo.com",
  "password": "abc123"
}
```
**Esperado:**
- Status: 400
- Response: `{ "error": "WEAK_PASSWORD" }`

### TC-1.3.1: Email duplicado
```json
POST /api/auth/register
{
  "name": "Pedro",
  "email": "super@exemplo.com",
  "password": "Senha@123"
}
```
**Esperado:**
- Status: 409
- Response: `{ "error": "EMAIL_ALREADY_EXISTS" }`

---

## TESTE 2: LOGIN

### TC-2.1.1: Login com sucesso
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "super@exemplo.com",
  "password": "SuperAdmin@123"
}
```
**Esperado:**
- Status: 200
- Response: `{ "accessToken": "eyJ...", "user": {...} }`
- Response Headers: Set-Cookie com refreshToken

**Verificações:**
1. Decodificar accessToken em jwt.io
   - sub: <uuid_do_usuario>
   - role: SUPER_ADMIN
   - email: super@exemplo.com
   - exp: timestamp futuro
   - iat: timestamp recente

2. Inspecionar Cookie
   - Nome: refreshToken
   - HttpOnly: true
   - Secure: false (em dev)
   - SameSite: Strict

3. Banco de dados
   - Nova linha em SessaoJWT
   - is_active = 1
   - created_at = agora

### TC-2.2.1: Senha errada
```json
POST /api/auth/login
{
  "email": "super@exemplo.com",
  "password": "SenhaErrada@123"
}
```
**Esperado:**
- Status: 401
- Response: `{ "error": "INVALID_CREDENTIALS" }`

### TC-2.3.1: Rate limiting (5 tentativas)
```bash
# Fazer POST para /api/auth/login com dados errados 5 vezes
# 1ª tentativa: Status 401
# 2ª tentativa: Status 401
# 3ª tentativa: Status 401
# 4ª tentativa: Status 401
# 5ª tentativa: Status 429
# Response: { "error": "TOO_MANY_ATTEMPTS" }
```

**Verificação no banco:**
- Campo failed_login_attempts = 5
- Campo blocked_until > agora

---

## TESTE 3: LOGOUT

### TC-3.1.1: Logout com JWT válido
```json
POST /api/auth/logout
Authorization: Bearer eyJ...
```
**Esperado:**
- Status: 200
- Response: `{ "message": "Logout realizado com sucesso" }`

**Verificações:**
1. Cookie removido
   - Set-Cookie: refreshToken=; Max-Age=0

2. Banco de dados (SessaoJWT)
   - is_active = 0
   - logout_at = agora

### TC-3.3.1: Double logout
```bash
# Fazer 2x POST /api/auth/logout
# 1ª: Status 200
# 2ª: Status 401 (session já inativa)
```

---

## TESTE 4: JWT ACCESS TOKEN

### TC-4.1.1: Verificar estrutura do token
```bash
# Copiar accessToken da resposta de login
# Cola em https://jwt.io/

# Verificar estrutura:
# Header: {"alg":"HS256","typ":"JWT"}
# Payload: 
# {
#   "sub": "uuid-do-usuario",
#   "role": "SUPER_ADMIN",
#   "email": "super@exemplo.com",
#   "iat": 1234567890,
#   "exp": 1234654290
# }
# Signature: validado com JWT_SECRET
```

### TC-4.3.1: Token expirado
```bash
# Criar manualmente um token com exp no passado
# Tentar usar em requisição autenticada

POST /api/auth/profile
Authorization: Bearer eyJ...expirado
```
**Esperado:**
- Status: 401
- Response: `{ "error": "TOKEN_EXPIRED" }`

---

## TESTE 5: REFRESH TOKEN

### TC-5.1.1: Renovar token
```json
POST /api/auth/refresh
(Cookie com refreshToken automaticamente enviado)
```
**Esperado:**
- Status: 200
- Response: `{ "accessToken": "eyJ...novo" }`
- Set-Cookie: novo refreshToken

**Verificação:**
- Novo accessToken funciona em requisições subsequentes
- last_activity em SessaoJWT atualizado

### TC-5.2.2: Refresh com token expirado
```bash
# Fazer POST /api/auth/refresh após 7+ dias
```
**Esperado:**
- Status: 401
- Response: `{ "error": "REFRESH_TOKEN_EXPIRED" }`

---

## TESTE 6: RECUPERAÇÃO DE SENHA

### TC-6.1.1: Solicitar reset
```json
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "super@exemplo.com"
}
```
**Esperado:**
- Status: 200
- Response: `{ "message": "Email de recuperação enviado" }`
- NÃO confirma se email existe

**Verificação no banco:**
- Nova linha em TokenRecuperacao
- reset_token preenchido (SHA256)
- expires_at = agora + 1h

### TC-6.3.1: Reset com token válido
```json
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "sha256_do_reset_token",
  "newPassword": "NovaSenha@456"
}
```
**Esperado:**
- Status: 200
- Response: `{ "message": "Senha alterada com sucesso" }`

**Verificações:**
1. Banco: TokenRecuperacao marcado como usado
2. Tentar login com senha antiga: FALHA
3. Tentar login com nova senha: SUCESSO
4. Todas as SessaoJWT do usuário: is_active = 0 (logout forçado)

### TC-6.4.5: Reset com senha anterior
```json
POST /api/auth/reset-password
{
  "token": "token_valido",
  "newPassword": "SuperAdmin@123"  // Mesma senha
}
```
**Esperado:**
- Status: 400
- Response: `{ "error": "PASSWORD_SAME_AS_OLD" }`

---

## TESTE 7: PERMISSÕES

### TC-7.2.1: MEMBRO acessa admin
```json
GET /api/admin/cms
Authorization: Bearer eyJ_membro...
```
**Esperado:**
- Status: 403
- Response: `{ "error": "FORBIDDEN", "message": "Acesso negado" }`

### TC-7.2.2: ADMIN edita CMS
```json
PUT /api/admin/cms/home-hero
Authorization: Bearer eyJ_admin...
Content-Type: application/json

{
  "title": "Novo Título",
  "subtitle": "Novo Subtítulo"
}
```
**Esperado:**
- Status: 200
- CMS atualizado

### TC-7.1.2: SUPER_ADMIN pode tudo
```json
GET /api/admin/users
Authorization: Bearer eyJ_super_admin...
```
**Esperado:**
- Status: 200
- Lista de usuários retornada

---

## TESTE 8: MIDDLEWARE

### TC-8.1.1: Requisição com JWT válido
```json
GET /api/auth/profile
Authorization: Bearer eyJ...valido

# DevTools Console (Network):
# Status: 200
# Response tem user.id, user.email, user.role
```

### TC-8.1.4: Requisição sem JWT em rota protegida
```json
GET /api/auth/profile
(Sem Authorization header)
```
**Esperado:**
- Status: 401
- Response: `{ "error": "UNAUTHORIZED" }`

---

## TESTE 9: PROTEÇÃO DE ROTAS

### TC-9.1.2: Rota pública sem JWT
```json
POST /api/auth/register
(Sem JWT)

{
  "name": "Teste",
  "email": "teste@exemplo.com",
  "password": "Senha@123"
}
```
**Esperado:**
- Status: 201 ou 400 (erro de validação)
- NÃO é 401

### TC-9.2.1: Rota protegida sem JWT
```json
GET /api/auth/profile
(Sem JWT)
```
**Esperado:**
- Status: 401

### TC-9.3.1: MEMBRO acessa /api/admin
```json
POST /api/admin/cms/home-hero
Authorization: Bearer eyJ_membro...
```
**Esperado:**
- Status: 403

---

## TESTE 10: SEGURANÇA

### TC-10.1.1: SQL Injection
```json
POST /api/auth/login
{
  "email": "admin@exemplo.com' OR '1'='1",
  "password": "'; DROP TABLE usuarios; --"
}
```
**Esperado:**
- Status: 401 ou 400
- NÃO executa SQL, não deleta dados

### TC-10.2.1: Senha não retornada
```bash
# Após login, verificar response:
# NÃO deve conter campo "password"
# Verificar em:
# - /api/auth/login response
# - /api/auth/profile response
# - /api/admin/users response
```

---

## CHECKLIST DE EXECUÇÃO

- [ ] Ambiente preparado
- [ ] Banco resetado com seed
- [ ] Dev server rodando
- [ ] PostMan/Insomnia configurado

### Teste 1: Cadastro (20 cenários)
- [ ] TC-1.1.1 até TC-1.4.4 executados
- [ ] Todos os testes passaram?

### Teste 2: Login (25 cenários)
- [ ] TC-2.1.1 até TC-2.5.3 executados
- [ ] Rate limiting funciona?

### Teste 3: Logout (11 cenários)
- [ ] TC-3.1.1 até TC-3.3.2 executados
- [ ] Session invalidada?

### Teste 4: JWT (16 cenários)
- [ ] TC-4.1.1 até TC-4.5.2 executados
- [ ] Token estrutura correta?

### Teste 5: Refresh Token (16 cenários)
- [ ] TC-5.1.1 até TC-5.4.2 executados
- [ ] Tokens renovam?

### Teste 6: Recuperação Senha (23 cenários)
- [ ] TC-6.1.1 até TC-6.5.4 executados
- [ ] Reset funciona?

### Teste 7: Permissões (9 cenários)
- [ ] TC-7.1.1 até TC-7.3.2 executados
- [ ] Roles funcionam?

### Teste 8: Middleware (8 cenários)
- [ ] TC-8.1.1 até TC-8.3.2 executados
- [ ] Autenticação funciona?

### Teste 9: Rotas (14 cenários)
- [ ] TC-9.1.1 até TC-9.5.2 executados
- [ ] Proteção de rotas?

### Teste 10: Segurança (7 cenários)
- [ ] TC-10.1.1 até TC-10.2.3 executados
- [ ] Sem brechas?

---

## RESULTADO FINAL

Total de testes: **149**
Total executados: ___/149
Testes com sucesso: ___/149
Testes com falha: ___/149

**Status:** [ ] APROVADO [ ] COM AJUSTES [ ] REJEITADO

Observações:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Depois de completar todos os 149 testes com sucesso, você está pronto para ETAPA 3!**
