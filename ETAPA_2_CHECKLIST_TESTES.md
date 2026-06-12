# ETAPA 2 - CHECKLIST DE TESTES PARA AUTENTICAÇÃO

## Índice de Testes
1. [Cadastro (Register)](#1-cadastro-register)
2. [Login](#2-login)
3. [Logout](#3-logout)
4. [JWT Access Token](#4-jwt-access-token)
5. [Refresh Token](#5-refresh-token)
6. [Recuperação de Senha](#6-recuperação-de-senha)
7. [Controle de Permissões](#7-controle-de-permissões)
8. [Middleware de Autenticação](#8-middleware-de-autenticação)
9. [Proteção de Rotas](#9-proteção-de-rotas)

---

## 1. CADASTRO (REGISTER)

### 1.1 Cadastro com Sucesso
- [ ] **TC-1.1.1** - Cadastro com dados válidos (nome, email, senha válida)
  - Expected: Status 201, usuário criado, retorna usuário + tokens
  - Verificar: Senha armazenada com hash Bcrypt, email único

- [ ] **TC-1.1.2** - Email é armazenado em lowercase
  - Expected: Email normalizado
  - Verificar: Database tem email normalizado

- [ ] **TC-1.1.3** - Novo usuário tem role MEMBRO por padrão
  - Expected: role = 'MEMBRO'
  - Verificar: Campo role no banco

- [ ] **TC-1.1.4** - Session criada automaticamente após cadastro
  - Expected: Sessão registrada em SessaoJWT
  - Verificar: IP e userAgent salvos

### 1.2 Cadastro - Validação de Dados
- [ ] **TC-1.2.1** - Email inválido
  - Input: "naoehum@email"
  - Expected: Status 400, error.code = 'INVALID_EMAIL'

- [ ] **TC-1.2.2** - Email vazio
  - Input: ""
  - Expected: Status 400, error.code = 'EMAIL_REQUIRED'

- [ ] **TC-1.2.3** - Senha fraca (< 8 caracteres)
  - Input: "abc123"
  - Expected: Status 400, error.code = 'WEAK_PASSWORD'

- [ ] **TC-1.2.4** - Senha sem maiúscula
  - Input: "abcdefgh123"
  - Expected: Status 400, error.code = 'WEAK_PASSWORD'

- [ ] **TC-1.2.5** - Senha sem minúscula
  - Input: "ABCDEFGH123"
  - Expected: Status 400, error.code = 'WEAK_PASSWORD'

- [ ] **TC-1.2.6** - Senha sem números
  - Input: "AbcdefghIJK"
  - Expected: Status 400, error.code = 'WEAK_PASSWORD'

- [ ] **TC-1.2.7** - Nome vazio
  - Input: ""
  - Expected: Status 400, error.code = 'NAME_REQUIRED'

### 1.3 Cadastro - Duplicação
- [ ] **TC-1.3.1** - Email já existente
  - Input: Email de usuário existente
  - Expected: Status 409, error.code = 'EMAIL_ALREADY_EXISTS'
  - Verificar: Não expõe que email existe (segurança)

- [ ] **TC-1.3.2** - Segunda tentativa de cadastro com mesmo email após 5 minutos
  - Expected: Status 409, mesmo erro
  - Verificar: Email permanece único

### 1.4 Cadastro - Edge Cases
- [ ] **TC-1.4.1** - Email com espaços em branco
  - Input: " usuario@email.com "
  - Expected: Email trimmed

- [ ] **TC-1.4.2** - Nome com caracteres especiais
  - Input: "José da Silva"
  - Expected: Aceito e armazenado

- [ ] **TC-1.4.3** - Requisição sem Content-Type
  - Expected: Status 400

- [ ] **TC-1.4.4** - Payload JSON inválido
  - Expected: Status 400

---

## 2. LOGIN

### 2.1 Login com Sucesso
- [ ] **TC-2.1.1** - Login com email e senha corretos
  - Expected: Status 200, access_token, refresh_token em cookie
  - Verificar: Token é JWT válido

- [ ] **TC-2.1.2** - Access token contém sub (user_id)
  - Expected: JWT payload contém "sub": "<user_id>"
  - Verificar: payload.sub === usuário_id

- [ ] **TC-2.1.3** - Access token tem expiração de 24h
  - Expected: payload.exp = agora + 86400
  - Verificar: exp em segundos (Unix timestamp)

- [ ] **TC-2.1.4** - Refresh token em cookie httpOnly
  - Expected: Set-Cookie com httpOnly, secure, sameSite
  - Verificar: JavaScript não consegue acessar

- [ ] **TC-2.1.5** - Session criada e armazenada no banco
  - Expected: Linha em SessaoJWT com IP e userAgent corretos
  - Verificar: created_at, last_activity, is_active = true

- [ ] **TC-2.1.6** - Contador de tentativas resetado
  - Expected: login_attempts = 0
  - Verificar: failed_login_attempts zerado

### 2.2 Login - Falha na Autenticação
- [ ] **TC-2.2.1** - Email correto, senha errada
  - Expected: Status 401, error.code = 'INVALID_CREDENTIALS'
  - Verificar: Mensagem não expõe qual é o erro

- [ ] **TC-2.2.2** - Email errado, senha certa
  - Expected: Status 401, error.code = 'INVALID_CREDENTIALS'
  - Verificar: Mesmo erro do anterior (não expõe)

- [ ] **TC-2.2.3** - Email e senha ambos errados
  - Expected: Status 401, error.code = 'INVALID_CREDENTIALS'

### 2.3 Login - Rate Limiting
- [ ] **TC-2.3.1** - 5 tentativas falhadas consecutivas
  - Expected: Status 429 na 5ª tentativa, error.code = 'TOO_MANY_ATTEMPTS'
  - Verificar: failed_login_attempts = 5

- [ ] **TC-2.3.2** - Usuário bloqueado por 15 minutos
  - Expected: Status 429, error.code = 'ACCOUNT_LOCKED'
  - Verificar: Campo blocked_until tem timestamp futuro

- [ ] **TC-2.3.3** - Após 15 minutos, consegue tentar novamente
  - Expected: blocked_until expirado, pode fazer nova tentativa
  - Verificar: Time-based unlock funciona

- [ ] **TC-2.3.4** - 6ª tentativa imediata após bloqueio
  - Expected: Status 429, ainda bloqueado

### 2.4 Login - Validação
- [ ] **TC-2.4.1** - Email vazio
  - Expected: Status 400, error.code = 'EMAIL_REQUIRED'

- [ ] **TC-2.4.2** - Senha vazia
  - Expected: Status 400, error.code = 'PASSWORD_REQUIRED'

- [ ] **TC-2.4.3** - Email inválido
  - Expected: Status 400, error.code = 'INVALID_EMAIL'

- [ ] **TC-2.4.4** - Ambos vazios
  - Expected: Status 400

### 2.5 Login - Email Verification (se implementado)
- [ ] **TC-2.5.1** - Usuário sem email verificado consegue fazer login
  - Expected: Status 200 (login funciona)
  - Verificar: email_verified pode ser false

---

## 3. LOGOUT

### 3.1 Logout com Sucesso
- [ ] **TC-3.1.1** - Logout com JWT válido
  - Expected: Status 200, mensagem de sucesso
  - Verificar: Session marcada como inativa

- [ ] **TC-3.1.2** - Session invalidada no banco
  - Expected: is_active = false, logout_at preenchido
  - Verificar: Timestamp de logout correto

- [ ] **TC-3.1.3** - Refresh token deletado do cookie
  - Expected: Set-Cookie com Max-Age=0 ou Expires no passado
  - Verificar: Cookie removido do navegador

- [ ] **TC-3.1.4** - Múltiplas sessões do mesmo usuário
  - Expected: Apenas a sessão atual é invalidada
  - Verificar: Outras sessions permanecem ativas

### 3.2 Logout - Sem Autenticação
- [ ] **TC-3.2.1** - Logout sem JWT
  - Expected: Status 401, error.code = 'UNAUTHORIZED'

- [ ] **TC-3.2.2** - Logout com JWT inválido
  - Expected: Status 401, error.code = 'INVALID_TOKEN'

- [ ] **TC-3.2.3** - Logout com JWT expirado
  - Expected: Status 401, error.code = 'TOKEN_EXPIRED'

### 3.3 Logout - Edge Cases
- [ ] **TC-3.3.1** - Double logout (logout 2x)
  - Expected: 1ª vez = 200, 2ª vez = 401 (session já inativa)

- [ ] **TC-3.3.2** - Logout após deletar user
  - Expected: Status 401, usuário não encontrado

---

## 4. JWT ACCESS TOKEN

### 4.1 Estrutura do Token
- [ ] **TC-4.1.1** - Token tem 3 partes separadas por ponto
  - Expected: header.payload.signature
  - Verificar: Cada parte é base64

- [ ] **TC-4.1.2** - Header contém alg e typ
  - Expected: {"alg": "HS256", "typ": "JWT"}

- [ ] **TC-4.1.3** - Payload contém sub (user_id)
  - Expected: {"sub": "<uuid_user_id>"}

- [ ] **TC-4.1.4** - Payload contém role
  - Expected: {"role": "MEMBRO" | "ADMIN" | "SUPER_ADMIN"}

- [ ] **TC-4.1.5** - Payload contém email
  - Expected: {"email": "usuario@email.com"}

- [ ] **TC-4.1.6** - Payload contém iat (issued at)
  - Expected: Unix timestamp de criação

- [ ] **TC-4.1.7** - Payload contém exp (expiration)
  - Expected: iat + 86400 (24h)

### 4.2 Assinatura do Token
- [ ] **TC-4.2.1** - Token pode ser decodificado com JWT_SECRET
  - Expected: decode() funciona

- [ ] **TC-4.2.2** - Token não pode ser alterado sem invalidar assinatura
  - Expected: Alteração do payload invalida o token
  - Verificar: Teste alterar payload e tentar usar

- [ ] **TC-4.2.3** - Assinatura valida com HS256
  - Expected: verify() com JWT_SECRET passa
  - Verificar: signature bate com hash

### 4.3 Expiração do Token
- [ ] **TC-4.3.1** - Token expirado é rejeitado
  - Expected: Status 401, error.code = 'TOKEN_EXPIRED'
  - Verificar: Usar token com exp no passado

- [ ] **TC-4.3.2** - Token com exp daqui a 23h59min é aceito
  - Expected: Token válido

- [ ] **TC-4.3.3** - Token com exp agora é rejeitado
  - Expected: Status 401, TOKEN_EXPIRED

### 4.4 Validação do Token
- [ ] **TC-4.4.1** - Token vazio é rejeitado
  - Expected: Status 401, error.code = 'INVALID_TOKEN'

- [ ] **TC-4.4.2** - Token malformado é rejeitado
  - Expected: Status 401, error.code = 'INVALID_TOKEN'

- [ ] **TC-4.4.3** - Token com caracteres inválidos é rejeitado
  - Expected: Status 401, error.code = 'INVALID_TOKEN'

- [ ] **TC-4.4.4** - Token assinado com chave errada é rejeitado
  - Expected: Status 401, error.code = 'INVALID_TOKEN'

### 4.5 Armazenamento do Token
- [ ] **TC-4.5.1** - Access token vem no body (JSON)
  - Expected: {"accessToken": "eyJ..."}

- [ ] **TC-4.5.2** - Access token NÃO é HttpOnly (para usar no fetch)
  - Expected: Token está no body, não em cookie

---

## 5. REFRESH TOKEN

### 5.1 Refresh com Sucesso
- [ ] **TC-5.1.1** - Renovar token com refresh token válido
  - Expected: Status 200, novo access_token
  - Verificar: Novo token funciona para requisições

- [ ] **TC-5.1.2** - Novo access token tem expiração 24h
  - Expected: exp = agora + 86400

- [ ] **TC-5.1.3** - Novo refresh token gerado e enviado em cookie
  - Expected: Set-Cookie com novo token

- [ ] **TC-5.1.4** - Session updated_at atualizado
  - Expected: last_activity = agora

### 5.2 Refresh - Falha
- [ ] **TC-5.2.1** - Refresh com refresh token inválido
  - Expected: Status 401, error.code = 'INVALID_REFRESH_TOKEN'

- [ ] **TC-5.2.2** - Refresh com refresh token expirado
  - Expected: Status 401, error.code = 'REFRESH_TOKEN_EXPIRED'

- [ ] **TC-5.2.3** - Refresh sem refresh token no cookie
  - Expected: Status 401, error.code = 'REFRESH_TOKEN_MISSING'

- [ ] **TC-5.2.4** - Refresh com session inativa no banco
  - Expected: Status 401, error.code = 'SESSION_EXPIRED'

### 5.3 Refresh - Segurança
- [ ] **TC-5.3.1** - IP diferente no refresh
  - Expected: Aviso ou rejeição (conforme política)
  - Verificar: Log de auditoria

- [ ] **TC-5.3.2** - User-Agent diferente no refresh
  - Expected: Aviso ou rejeição (conforme política)
  - Verificar: Log de auditoria

- [ ] **TC-5.3.3** - Múltiplos refreshs sucessivos
  - Expected: Todos válidos e geram novos tokens

- [ ] **TC-5.3.4** - Refresh token reusado (token invalidado)
  - Expected: Status 401, token anterior não funciona mais
  - Verificar: Rotation token implementada

### 5.4 Refresh - Edge Cases
- [ ] **TC-5.4.1** - Refresh após logout
  - Expected: Status 401, session marcada como logout_at
  - Verificar: Session é a mesma?

- [ ] **TC-5.4.2** - Refresh com usuário deletado
  - Expected: Status 401, usuário não encontrado

---

## 6. RECUPERAÇÃO DE SENHA

### 6.1 Forgot Password - Sucesso
- [ ] **TC-6.1.1** - Solicitar reset de senha com email válido
  - Expected: Status 200, mensagem "Email enviado"
  - Verificar: Não confirma se email existe (segurança)

- [ ] **TC-6.1.2** - Token de recuperação gerado
  - Expected: TokenRecuperacao criado no banco
  - Verificar: reset_token não nulo

- [ ] **TC-6.1.3** - Token com expiração 1h
  - Expected: expires_at = agora + 3600
  - Verificar: Timestamp correto

- [ ] **TC-6.1.4** - Email enviado com link
  - Expected: (TODO) Integração de email
  - Verificar: Link contém token correto

### 6.2 Forgot Password - Validação
- [ ] **TC-6.2.1** - Email vazio
  - Expected: Status 400, error.code = 'EMAIL_REQUIRED'

- [ ] **TC-6.2.2** - Email inválido
  - Expected: Status 400, error.code = 'INVALID_EMAIL'

- [ ] **TC-6.2.3** - Email não existente
  - Expected: Status 200 (não expõe que email não existe)

### 6.3 Reset Password - Sucesso
- [ ] **TC-6.3.1** - Reset com token válido e senha nova válida
  - Expected: Status 200, senha alterada
  - Verificar: Nova senha diferente da antiga

- [ ] **TC-6.3.2** - Senha antiga não funciona mais
  - Expected: Login com senha antiga falha

- [ ] **TC-6.3.3** - Login com nova senha funciona
  - Expected: Login bem-sucedido

- [ ] **TC-6.3.4** - Todas as sessions invalidadas após reset
  - Expected: Usuário precisa fazer login novamente
  - Verificar: Todas as sessões em is_active = false

### 6.4 Reset Password - Falha
- [ ] **TC-6.4.1** - Reset com token inválido
  - Expected: Status 400, error.code = 'INVALID_RESET_TOKEN'

- [ ] **TC-6.4.2** - Reset com token expirado
  - Expected: Status 400, error.code = 'RESET_TOKEN_EXPIRED'

- [ ] **TC-6.4.3** - Reset com token vazio
  - Expected: Status 400, error.code = 'TOKEN_REQUIRED'

- [ ] **TC-6.4.4** - Reset com senha inválida
  - Expected: Status 400, error.code = 'WEAK_PASSWORD'

- [ ] **TC-6.4.5** - Reset com mesma senha anterior
  - Expected: Status 400, error.code = 'PASSWORD_SAME_AS_OLD'
  - Verificar: Não permite reutilizar senha

### 6.5 Reset Password - Edge Cases
- [ ] **TC-6.5.1** - Múltiplos resets diferentes para mesmo usuário
  - Expected: Último token gerado é o válido
  - Verificar: Tokens anteriores invalidados

- [ ] **TC-6.5.2** - Reset após 59 minutos (antes de expirar)
  - Expected: Funciona

- [ ] **TC-6.5.3** - Reset após 1h1min (após expiração)
  - Expected: Token expirado

- [ ] **TC-6.5.4** - Change password enquanto há reset token pendente
  - Expected: Reset token permanece válido
  - Verificar: Não há conflito

---

## 7. CONTROLE DE PERMISSÕES

### 7.1 Roles e Permissions
- [ ] **TC-7.1.1** - SUPER_ADMIN tem todas as permissões
  - Expected: Pode acessar qualquer recurso
  - Verificar: hasPermission sempre retorna true

- [ ] **TC-7.1.2** - ADMIN tem permissões parciais
  - Expected: Pode gerenciar conteúdo, não pode gerenciar usuários
  - Verificar: Pode editar CMS, não pode deletar usuários

- [ ] **TC-7.1.3** - MEMBRO tem permissões limitadas
  - Expected: Só pode acessar cursos comprados/registrados
  - Verificar: Não pode acessar admin

### 7.2 Authorization Checks
- [ ] **TC-7.2.1** - MEMBRO tenta acessar admin panel
  - Expected: Status 403, error.code = 'FORBIDDEN'

- [ ] **TC-7.2.2** - ADMIN tenta deletar outro usuário
  - Expected: Status 403, error.code = 'FORBIDDEN'
  - Verificar: SUPER_ADMIN consegue

- [ ] **TC-7.2.3** - Usuário tenta editar CMS sem permissão
  - Expected: Status 403, error.code = 'FORBIDDEN'

### 7.3 Permission Levels
- [ ] **TC-7.3.1** - SUPER_ADMIN > ADMIN > MEMBRO
  - Expected: Hierarquia de permissões respeitada
  - Verificar: SUPER_ADMIN consegue fazer tudo que ADMIN consegue

- [ ] **TC-7.3.2** - Permissão específica por recurso
  - Expected: ADMIN pode editar CMS mas não gerenciar cursos premium
  - Verificar: Conforme política definida

---

## 8. MIDDLEWARE DE AUTENTICAÇÃO

### 8.1 Authentication Middleware
- [ ] **TC-8.1.1** - Requisição com JWT válido passa pelo middleware
  - Expected: Request prossegue, req.user preenchido
  - Verificar: req.user.id, req.user.role, req.user.email

- [ ] **TC-8.1.2** - Requisição com JWT inválido é bloqueada
  - Expected: Status 401, erro antes de chegar ao handler

- [ ] **TC-8.1.3** - Requisição com JWT expirado tenta refresh
  - Expected: Status 401, error.code = 'TOKEN_EXPIRED'
  - Verificar: Cliente deve chamar /refresh

- [ ] **TC-8.1.4** - Requisição sem JWT é bloqueada (em rota protegida)
  - Expected: Status 401, error.code = 'UNAUTHORIZED'

- [ ] **TC-8.1.5** - JWT extraído do header Authorization
  - Expected: Bearer eyJ... funciona
  - Verificar: "Bearer <token>" correto

### 8.2 Authorization Middleware
- [ ] **TC-8.2.1** - Middleware verifica role do usuário
  - Expected: SUPER_ADMIN passa, MEMBRO pode ser bloqueado
  - Verificar: Conforme a rota

- [ ] **TC-8.2.2** - Múltiplos middlewares em chain funcionam
  - Expected: Auth → Authorization → Handler
  - Verificar: Ordem correta

### 8.3 Request Enrichment
- [ ] **TC-8.3.1** - req.user preenchido com dados do JWT
  - Expected: req.user.sub === user_id
  - Verificar: req.user.role, req.user.email

- [ ] **TC-8.3.2** - req.session preenchido com dados da session
  - Expected: req.session.id, req.session.ip, req.session.userAgent

---

## 9. PROTEÇÃO DE ROTAS

### 9.1 Public Routes (sem autenticação)
- [ ] **TC-9.1.1** - GET / funciona sem JWT
  - Expected: Status 200

- [ ] **TC-9.1.2** - POST /api/auth/register funciona sem JWT
  - Expected: Status 200 ou 400 (conforme validação), não 401

- [ ] **TC-9.1.3** - POST /api/auth/login funciona sem JWT
  - Expected: Status 200 ou 401 (credenciais), não 403

### 9.2 Protected Routes (requer autenticação)
- [ ] **TC-9.2.1** - GET /api/auth/profile sem JWT
  - Expected: Status 401, error.code = 'UNAUTHORIZED'

- [ ] **TC-9.2.2** - GET /api/auth/profile com JWT válido
  - Expected: Status 200, retorna dados do usuário

- [ ] **TC-9.2.3** - POST /api/auth/logout sem JWT
  - Expected: Status 401

- [ ] **TC-9.2.4** - POST /api/auth/logout com JWT
  - Expected: Status 200, session invalidada

### 9.3 Admin Routes (requer ADMIN ou SUPER_ADMIN)
- [ ] **TC-9.3.1** - MEMBRO acessa /api/admin/*
  - Expected: Status 403, error.code = 'FORBIDDEN'

- [ ] **TC-9.3.2** - ADMIN acessa /api/admin/cms
  - Expected: Status 200 ou conforme endpoint

- [ ] **TC-9.3.3** - SUPER_ADMIN acessa /api/admin/users
  - Expected: Status 200 ou conforme endpoint

- [ ] **TC-9.3.4** - ADMIN acessa /api/admin/users (gerenciar usuários)
  - Expected: Status 403, conforme política
  - Verificar: SUPER_ADMIN consegue

### 9.4 Resource-Based Access
- [ ] **TC-9.4.1** - Usuário A tenta acessar dados de Usuário B
  - Expected: Status 403, error.code = 'FORBIDDEN'

- [ ] **TC-9.4.2** - Usuário acessa próprios dados
  - Expected: Status 200

- [ ] **TC-9.4.3** - ADMIN acessa dados de qualquer usuário
  - Expected: Status 200
  - Verificar: Política de auditoria

### 9.5 CORS e Segurança
- [ ] **TC-9.5.1** - Requisição CORS de origem diferente
  - Expected: Conforme política CORS

- [ ] **TC-9.5.2** - Preflight OPTIONS request
  - Expected: Status 200, headers CORS corretos

---

## 10. TESTES DE SEGURANÇA

### 10.1 Proteção contra Ataques
- [ ] **TC-10.1.1** - SQL Injection na senha
  - Input: "'; DROP TABLE usuarios; --"
  - Expected: Tratado como string normal

- [ ] **TC-10.1.2** - XSS no nome
  - Input: "<script>alert('xss')</script>"
  - Expected: Escapado ou sanitizado

- [ ] **TC-10.1.3** - CSRF token não implementado (conforme política)
  - Expected: Aplicável se usar session cookies tradicionais
  - Verificar: JWT reduz risco

- [ ] **TC-10.1.4** - Brute Force bloqueado após 5 tentativas
  - Expected: rate limiting funciona
  - Verificar: Account locked por 15 min

### 10.2 Dados Sensíveis
- [ ] **TC-10.2.1** - Senha não retornada em nenhuma resposta
  - Expected: Campo password nunca no response
  - Verificar: Audit logs, profile, etc.

- [ ] **TC-10.2.2** - JWT não contém senha
  - Expected: Token é seguro mesmo exposto
  - Verificar: Decoder mostra sub, role, email, mas não senha

- [ ] **TC-10.2.3** - Refresh token em httpOnly cookie (não acessível via JS)
  - Expected: Cookie com httpOnly=true, secure=true (em HTTPS)

---

## RESUMO DE CENÁRIOS

| Categoria | Total | Checklist |
|-----------|-------|-----------|
| Cadastro (Register) | 20 | TC-1.1 a TC-1.4 |
| Login | 25 | TC-2.1 a TC-2.5 |
| Logout | 11 | TC-3.1 a TC-3.3 |
| JWT | 16 | TC-4.1 a TC-4.5 |
| Refresh Token | 16 | TC-5.1 a TC-5.4 |
| Recuperação de Senha | 23 | TC-6.1 a TC-6.5 |
| Permissões | 9 | TC-7.1 a TC-7.3 |
| Middleware | 8 | TC-8.1 a TC-8.3 |
| Proteção de Rotas | 14 | TC-9.1 a TC-9.5 |
| Segurança | 7 | TC-10.1 a TC-10.2 |
| **TOTAL** | **149 TESTES** | |

---

## CHECKLIST FINAL

### Antes de Começar Testes
- [ ] Ambiente .env.local configurado com JWT_SECRET
- [ ] Banco de dados resetado com seed data
- [ ] Prisma Client atualizado
- [ ] Dev server rodando
- [ ] PostMan ou Insomnia configurado

### Após Testes
- [ ] Todos os testes com status ✓
- [ ] Não há testes pendentes
- [ ] Documentação atualizada
- [ ] Casos de erro tratados adequadamente
- [ ] Performance dentro do esperado

---

## EXECUÇÃO DOS TESTES

### Recomendação de Ordem
1. Começar com **Cadastro** (TC-1.x) - Base do sistema
2. Depois **Login** (TC-2.x) - Autenticação
3. Depois **JWT** (TC-4.x) - Validação do token
4. Depois **Refresh Token** (TC-5.x) - Renovação
5. Depois **Logout** (TC-3.x) - Encerramento
6. Depois **Recuperação de Senha** (TC-6.x) - Reset
7. Depois **Permissões** (TC-7.x) - Autorização
8. Depois **Middleware** (TC-8.x) - Fluxo
9. Depois **Proteção de Rotas** (TC-9.x) - Segurança
10. Por fim **Segurança** (TC-10.x) - Edge cases

### Ferramentas Necessárias
- **PostMan / Insomnia** - Para testar endpoints
- **Browser DevTools** - Para inspecionar cookies
- **JWT.io** - Para decodificar tokens
- **Database Client** - Para verificar dados (phpMyAdmin, MySQL Workbench)

---

## PRÓXIMOS PASSOS

- [ ] Confirmar que todos os 149 testes foram executados com sucesso
- [ ] Documentar quaisquer falhas encontradas
- [ ] Corrigir issues identificadas
- [ ] Após aprovação, prosseguir com ETAPA 3 - CMS Backend

**Status: Aguardando execução dos testes** ✓
