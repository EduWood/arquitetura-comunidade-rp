# REVISÃO FINAL - COMUNIDADE RP

## ALTERAÇÕES APLICADAS

### 1. MÓDULOS REMOVIDOS ✅

**Removidos completamente da arquitetura:**
- `operacoes_ao_vivo` ❌
- `operacoes_trades` ❌
- `operacoes_replays` ❌
- `comunidade_posts` ❌
- `comunidade_comentarios` ❌
- `comunidade_reacoes` ❌

Impacto:
- Remover tabelas correspondentes
- Remover APIs relacionadas
- Remover permissões associadas
- Remover componentes frontend (quando criados)
- Total de **6 tabelas removidas**
- Reduz de 29 para **23 tabelas**

---

### 2. SISTEMA DE PERMISSÕES SIMPLIFICADO ✅

**Novo modelo: 3 roles apenas**

#### SUPER_ADMIN
```
✅ Gerenciar administradores
✅ Gerenciar usuários
✅ Gerenciar cursos
✅ Gerenciar aulas
✅ Gerenciar conteúdos
✅ Gerenciar CMS
✅ Gerenciar uploads
✅ Gerenciar configurações críticas
✅ Visualizar logs de auditoria
✅ Gerenciar tickets
✅ Visualizar faturas
✅ Criar backups
```

#### ADMIN
```
✅ Gerenciar cursos (CRUD)
✅ Gerenciar aulas (CRUD)
✅ Gerenciar conteúdos (módulos, vídeos, PDFs)
✅ Gerenciar usuários comuns (editar, desativar)
✅ Gerenciar CMS (componentes públicos)
✅ Gerenciar uploads (imagens, PDFs)
✅ Responder tickets
✅ Visualizar relatórios
❌ Não pode gerenciar SUPER_ADMIN
❌ Não pode alterar configurações críticas
❌ Não pode visualizar logs de auditoria completos
```

#### MEMBRO
```
✅ Acessar cursos liberados
✅ Visualizar aulas compradas
✅ Fazer download de arquivos liberados
✅ Editar próprio perfil
✅ Abrir tickets (suporte)
✅ Visualizar meus cursos
✅ Visualizar progresso
✅ Acessar ferramentas externas
❌ Não pode criar cursos
❌ Não pode editar conteúdo
❌ Não pode gerenciar outros usuários
```

**Tabela única: `usuarios` com campo `role`**
```sql
CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBRO') DEFAULT 'MEMBRO',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 3. STORAGE: HOSTINGER ✅

**Mudança de estratégia:**

De:
- ❌ Vercel Blob Storage
- ❌ AWS S3
- ❌ Supabase Storage

Para:
- ✅ **Hostinger Storage (File Manager via FTP/SFTP)**

**Estrutura de diretórios Hostinger:**
```
/public/
├── uploads/
│   ├── imagens/
│   │   ├── cursos/
│   │   ├── depoimentos/
│   │   ├── logo/
│   │   └── favicon/
│   ├── pdfs/
│   │   ├── aulas/
│   │   ├── downloads/
│   │   └── materiais/
│   ├── videos/
│   │   └── miniaturas/
│   └── misc/
│       ├── hero/
│       ├── banners/
│       └── configuracoes/
└── temp/
    └── processando/
```

**Banco armazena apenas:**
- `caminho_arquivo` (relativo: `/uploads/imagens/cursos/123.jpg`)
- `nome_arquivo` (original: `curso-python.jpg`)
- `tamanho_bytes` (125000)
- `tipo_mime` (`image/jpeg`)
- `data_upload` (timestamp)
- `hash_md5` (validação)

**Vantagens:**
- ✅ Incluso no plano Hostinger
- ✅ Sem custos adicionais
- ✅ Fácil de gerenciar
- ✅ Backups automáticos
- ✅ CDN integrado do Hostinger

---

### 4. OBJETIVO REAL DA PLATAFORMA ✅

**Comunidade RP é uma plataforma de:**
- ✅ **Cursos online** (módulos, aulas, vídeos, PDFs)
- ✅ **Área de membros** (acesso a conteúdo premium)
- ✅ **Conteúdo premium** (gated content)
- ✅ **Downloads** (materiais, planilhas, indicadores)
- ✅ **Ferramentas externas** (links para TradingView, Discord, etc)
- ✅ **Gestão de alunos** (admin pode ver progresso, notas)
- ✅ **CMS completo** (editar tudo pelo painel)

**NÃO é uma plataforma de:**
- ❌ Rede social
- ❌ Corretora
- ❌ Execução de trades
- ❌ Sinais internos
- ❌ Chat em tempo real (apenas tickets de suporte)

---

## TABELAS FINAIS: 23 TABELAS

### Autenticação & Usuários (3)
1. `usuarios` - Usuários (SUPER_ADMIN, ADMIN, MEMBRO)
2. `sessoes_jwt` - Sessões JWT ativas
3. `tokens_recuperacao` - Recuperação de senha

### Cursos & Conteúdo (6)
4. `cursos` - Cursos
5. `modulos` - Módulos dos cursos
6. `aulas` - Aulas dos módulos
7. `usuario_cursos` - Inscrição do usuário em curso
8. `usuario_aulas` - Progresso do usuário nas aulas
9. `aula_conteudo` - Conteúdo (vídeo, PDF, etc) da aula

### Mídia & Uploads (3)
10. `midia_imagens` - Rastreamento de imagens
11. `midia_pdfs` - Rastreamento de PDFs
12. `midia_videos` - Rastreamento de vídeos (externa ou upload)

### Downloads (2)
13. `downloads` - Recursos para download
14. `usuario_downloads` - Controle de acesso a downloads

### CMS (6)
15. `cms_paginas` - Páginas públicas
16. `cms_secoes` - Seções (hero, benefícios, sobre, etc)
17. `cms_blocos_conteudo` - Blocos editáveis
18. `cms_configuracoes` - Configurações globais (logo, favicon, SEO)
19. `cms_depoimentos` - Depoimentos de clientes
20. `cms_faq` - FAQ

### Suporte & Auditoria (2)
21. `suporte_tickets` - Tickets de suporte
22. `suporte_mensagens` - Mensagens dos tickets
23. `log_auditoria` - Log de ações críticas

---

## RELACIONAMENTOS

```
usuarios (1) ──── (N) sessoes_jwt
usuarios (1) ──── (N) tokens_recuperacao
usuarios (1) ──── (N) usuario_cursos
usuarios (1) ──── (N) usuario_aulas
usuarios (1) ──── (N) usuario_downloads
usuarios (1) ──── (N) suporte_tickets
usuarios (1) ──── (N) suporte_mensagens

cursos (1) ──── (N) modulos
cursos (1) ──── (N) usuario_cursos

modulos (1) ──── (N) aulas

aulas (1) ──── (N) usuario_aulas
aulas (1) ──── (N) aula_conteudo

usuario_cursos (1) ──── (N) usuario_aulas

downloads (1) ──── (N) usuario_downloads

midia_imagens (1) ──── (N) cursos (capa)
midia_imagens (1) ──── (N) cms_secoes (hero background)
midia_imagens (1) ──── (N) cms_depoimentos (foto)

midia_pdfs (1) ──── (N) aula_conteudo
midia_pdfs (1) ──── (N) downloads

midia_videos (1) ──── (N) aula_conteudo

cms_paginas (1) ──── (N) cms_secoes
cms_secoes (1) ──── (N) cms_blocos_conteudo

suporte_tickets (1) ──── (N) suporte_mensagens
```

---

## RESUMO DE MUDANÇAS

| Aspecto | Antes | Depois | Mudança |
|--------|-------|--------|---------|
| **Tabelas** | 29 | 23 | -6 |
| **Roles** | 9 níveis complexos | 3 roles simples | Simplificado |
| **Storage** | Vercel Blob/AWS S3 | Hostinger Storage | Local |
| **Permissões** | Sistema granular | Role-based (RBAC) | Simplificado |
| **Objetivo** | Rede social + trades | Cursos + CMS | Focar |
| **Complexidade** | Alta | Média | Reduzida |
| **Time de Dev** | 6+ meses | 3-4 meses | -40% |

---

## ESTADO: PRONTO PARA ETAPA 1

A arquitetura foi **completamente revista e simplificada**.

Próximo passo: **ETAPA 1 - Schema Prisma + Migrations**

✅ Aguardando confirmação para prosseguir.
