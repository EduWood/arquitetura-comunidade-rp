# ETAPA 1: DATABASE SCHEMA

## Objetivo

Criar a estrutura completa do banco de dados para rodar em MySQL Hostinger com Prisma.

Incluindo:
- ✅ Schema Prisma completo
- ✅ Migrations SQL
- ✅ Seed data
- ✅ Índices otimizados
- ✅ Constraints
- ✅ Relacionamentos

---

## TABELAS FINAIS: 23 TABELAS

### 1. AUTENTICAÇÃO & USUÁRIOS

#### `usuarios`
```
Campos:
  id BIGINT (PK, AI)
  email VARCHAR(255) UNIQUE
  nome VARCHAR(255)
  senha VARCHAR(255) (bcrypt hash)
  role ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBRO')
  ativo BOOLEAN
  foto_perfil VARCHAR(255) (caminho em Hostinger)
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP
  ultimo_acesso TIMESTAMP

Índices:
  - email (UNIQUE)
  - role (para queries de permissão)
  - ativo (para soft delete)

Constraints:
  - email NOT NULL
  - nome NOT NULL
  - role NOT NULL DEFAULT 'MEMBRO'
  - ativo NOT NULL DEFAULT TRUE
```

#### `sessoes_jwt`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  token VARCHAR(500) (unique, indexado)
  ip_address VARCHAR(45)
  user_agent VARCHAR(500)
  expira_em TIMESTAMP
  criado_em TIMESTAMP

Índices:
  - usuario_id
  - token (UNIQUE)
  - expira_em (para limpeza automática)

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - token UNIQUE
```

#### `tokens_recuperacao`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  token VARCHAR(255) (UNIQUE)
  usado BOOLEAN
  expira_em TIMESTAMP
  criado_em TIMESTAMP

Índices:
  - usuario_id
  - token (UNIQUE)
  - expira_em

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - token UNIQUE
```

---

### 2. CURSOS & CONTEÚDO

#### `cursos`
```
Campos:
  id BIGINT (PK, AI)
  titulo VARCHAR(255)
  descricao TEXT
  slug VARCHAR(255) UNIQUE
  capa_imagem_id BIGINT (FK midia_imagens nullable)
  criador_id BIGINT (FK usuarios)
  ativo BOOLEAN
  requer_assinatura BOOLEAN
  ordem INT
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - slug (UNIQUE)
  - criador_id
  - ativo
  - requer_assinatura

Constraints:
  - FK criador_id → usuarios.id (ON DELETE RESTRICT)
  - FK capa_imagem_id → midia_imagens.id (ON DELETE SET NULL)
```

#### `modulos`
```
Campos:
  id BIGINT (PK, AI)
  curso_id BIGINT (FK cursos)
  titulo VARCHAR(255)
  descricao TEXT
  ordem INT
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - curso_id
  - ordem

Constraints:
  - FK curso_id → cursos.id (ON DELETE CASCADE)
  - UNIQUE(curso_id, ordem)
```

#### `aulas`
```
Campos:
  id BIGINT (PK, AI)
  modulo_id BIGINT (FK modulos)
  titulo VARCHAR(255)
  descricao TEXT
  ordem INT
  duracao_minutos INT
  liberada BOOLEAN
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - modulo_id
  - ordem
  - liberada

Constraints:
  - FK modulo_id → modulos.id (ON DELETE CASCADE)
  - UNIQUE(modulo_id, ordem)
```

#### `aula_conteudo`
```
Campos:
  id BIGINT (PK, AI)
  aula_id BIGINT (FK aulas)
  tipo ENUM('TEXTO', 'VIDEO', 'PDF', 'ARQUIVO')
  video_id BIGINT (FK midia_videos nullable)
  pdf_id BIGINT (FK midia_pdfs nullable)
  titulo VARCHAR(255)
  conteudo_html TEXT (para tipo TEXTO)
  ordem INT
  criado_em TIMESTAMP

Índices:
  - aula_id
  - tipo
  - ordem

Constraints:
  - FK aula_id → aulas.id (ON DELETE CASCADE)
  - FK video_id → midia_videos.id (ON DELETE SET NULL)
  - FK pdf_id → midia_pdfs.id (ON DELETE SET NULL)
```

#### `usuario_cursos`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  curso_id BIGINT (FK cursos)
  data_inscricao TIMESTAMP
  completado BOOLEAN
  data_conclusao TIMESTAMP nullable
  progresso_percentual INT (0-100)

Índices:
  - usuario_id
  - curso_id
  - completado

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - FK curso_id → cursos.id (ON DELETE CASCADE)
  - UNIQUE(usuario_id, curso_id)
  - CHECK progresso_percentual >= 0 AND progresso_percentual <= 100
```

#### `usuario_aulas`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  aula_id BIGINT (FK aulas)
  usuario_curso_id BIGINT (FK usuario_cursos)
  assistida BOOLEAN
  data_inicio TIMESTAMP
  data_conclusao TIMESTAMP nullable
  minutos_assistidos INT

Índices:
  - usuario_id
  - aula_id
  - usuario_curso_id
  - assistida

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - FK aula_id → aulas.id (ON DELETE CASCADE)
  - FK usuario_curso_id → usuario_cursos.id (ON DELETE CASCADE)
  - UNIQUE(usuario_id, aula_id)
```

---

### 3. MÍDIA & UPLOADS

#### `midia_imagens`
```
Campos:
  id BIGINT (PK, AI)
  caminho_arquivo VARCHAR(500) (/uploads/imagens/...)
  nome_arquivo VARCHAR(255)
  tamanho_bytes BIGINT
  tipo_mime VARCHAR(100) (image/jpeg, etc)
  hash_md5 VARCHAR(32) UNIQUE
  largura INT
  altura INT
  criado_por BIGINT (FK usuarios)
  criado_em TIMESTAMP

Índices:
  - hash_md5 (UNIQUE - para deduplicação)
  - criado_por
  - criado_em

Constraints:
  - FK criado_por → usuarios.id (ON DELETE SET NULL)
```

#### `midia_pdfs`
```
Campos:
  id BIGINT (PK, AI)
  caminho_arquivo VARCHAR(500) (/uploads/pdfs/...)
  nome_arquivo VARCHAR(255)
  tamanho_bytes BIGINT
  tipo_mime VARCHAR(100) (application/pdf)
  hash_md5 VARCHAR(32) UNIQUE
  num_paginas INT
  criado_por BIGINT (FK usuarios)
  criado_em TIMESTAMP

Índices:
  - hash_md5 (UNIQUE)
  - criado_por
  - criado_em

Constraints:
  - FK criado_por → usuarios.id (ON DELETE SET NULL)
```

#### `midia_videos`
```
Campos:
  id BIGINT (PK, AI)
  titulo VARCHAR(255)
  tipo ENUM('YOUTUBE', 'VIMEO', 'BUNNY', 'UPLOAD')
  video_id VARCHAR(255) (id do YouTube, Vimeo, etc)
  url_original VARCHAR(500) nullable
  caminho_arquivo VARCHAR(500) nullable (/uploads/videos/...)
  miniatura_id BIGINT (FK midia_imagens nullable)
  duracao_segundos INT
  tamanho_bytes BIGINT nullable
  criado_por BIGINT (FK usuarios)
  criado_em TIMESTAMP

Índices:
  - tipo
  - criado_por
  - criado_em

Constraints:
  - FK miniatura_id → midia_imagens.id (ON DELETE SET NULL)
  - FK criado_por → usuarios.id (ON DELETE SET NULL)
```

---

### 4. DOWNLOADS

#### `downloads`
```
Campos:
  id BIGINT (PK, AI)
  titulo VARCHAR(255)
  descricao TEXT
  pdf_id BIGINT (FK midia_pdfs)
  ordem INT
  ativo BOOLEAN
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - pdf_id
  - ativo
  - ordem

Constraints:
  - FK pdf_id → midia_pdfs.id (ON DELETE CASCADE)
```

#### `usuario_downloads`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  download_id BIGINT (FK downloads)
  data_acesso TIMESTAMP

Índices:
  - usuario_id
  - download_id
  - data_acesso

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - FK download_id → downloads.id (ON DELETE CASCADE)
  - UNIQUE(usuario_id, download_id)
```

---

### 5. CMS

#### `cms_configuracoes`
```
Campos:
  id BIGINT (PK, AI)
  chave VARCHAR(255) UNIQUE
  valor LONGTEXT (JSON)
  tipo ENUM('STRING', 'JSON', 'NUMERO', 'BOOLEAN')
  descricao TEXT
  editavel_painel BOOLEAN
  atualizado_por BIGINT (FK usuarios nullable)
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Chaves padrão:
  - site_titulo
  - site_descricao
  - logo_id (midia_imagens.id)
  - favicon_id (midia_imagens.id)
  - whatsapp_numero
  - redes_sociais (JSON: {instagram, facebook, youtube, linkedin})
  - email_contato
  - cor_primaria
  - cor_secundaria
  - seo_global (JSON: {meta_keywords, og_image_id})

Índices:
  - chave (UNIQUE)
  - atualizado_por

Constraints:
  - FK atualizado_por → usuarios.id (ON DELETE SET NULL)
```

#### `cms_paginas`
```
Campos:
  id BIGINT (PK, AI)
  titulo VARCHAR(255)
  slug VARCHAR(255) UNIQUE
  meta_descricao VARCHAR(160)
  meta_keywords VARCHAR(255)
  og_image_id BIGINT (FK midia_imagens nullable)
  publicada BOOLEAN
  criado_por BIGINT (FK usuarios)
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Páginas principais:
  - / (home)
  - /sobre
  - /contato
  - /politica-privacidade
  - /termos-servico

Índices:
  - slug (UNIQUE)
  - publicada
  - criado_por

Constraints:
  - FK og_image_id → midia_imagens.id (ON DELETE SET NULL)
  - FK criado_por → usuarios.id (ON DELETE RESTRICT)
```

#### `cms_secoes`
```
Campos:
  id BIGINT (PK, AI)
  pagina_id BIGINT (FK cms_paginas)
  tipo ENUM('HERO', 'BENEFICIOS', 'SOBRE', 'DEPOIMENTOS', 'FAQ', 'CTA', 'RODAPE')
  ordem INT
  titulo VARCHAR(255) nullable
  descricao TEXT nullable
  ativo BOOLEAN
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - pagina_id
  - tipo
  - ordem

Constraints:
  - FK pagina_id → cms_paginas.id (ON DELETE CASCADE)
```

#### `cms_blocos_conteudo`
```
Campos:
  id BIGINT (PK, AI)
  secao_id BIGINT (FK cms_secoes)
  tipo_bloco ENUM('TEXTO', 'IMAGEM', 'CARD', 'VIDEO', 'FORM')
  chave_identificador VARCHAR(255) (ex: 'beneficio_1')
  titulo VARCHAR(255) nullable
  conteudo_html TEXT
  imagem_id BIGINT (FK midia_imagens nullable)
  dados_json LONGTEXT (conteúdo estruturado em JSON)
  ordem INT
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

JSON estrutura por tipo:
  TEXTO: {titulo, paragrafo, destaque}
  IMAGEM: {largura, altura, alt_text}
  CARD: {titulo, subtitulo, icone, link}
  VIDEO: {video_id, tipo_video}
  FORM: {campos, acao}

Índices:
  - secao_id
  - chave_identificador
  - ordem

Constraints:
  - FK secao_id → cms_secoes.id (ON DELETE CASCADE)
  - FK imagem_id → midia_imagens.id (ON DELETE SET NULL)
```

#### `cms_depoimentos`
```
Campos:
  id BIGINT (PK, AI)
  cliente_nome VARCHAR(255)
  cliente_profissao VARCHAR(255) nullable
  cliente_foto_id BIGINT (FK midia_imagens nullable)
  depoimento_texto TEXT
  ordem INT
  ativo BOOLEAN
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - ativo
  - ordem
  - cliente_foto_id

Constraints:
  - FK cliente_foto_id → midia_imagens.id (ON DELETE SET NULL)
```

#### `cms_faq`
```
Campos:
  id BIGINT (PK, AI)
  pergunta VARCHAR(500)
  resposta TEXT
  categoria VARCHAR(100)
  ordem INT
  ativo BOOLEAN
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - categoria
  - ativo
  - ordem

Constraints:
  - CHECK LENGTH(pergunta) <= 500
```

---

### 6. SUPORTE & AUDITORIA

#### `suporte_tickets`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios)
  titulo VARCHAR(255)
  descricao TEXT
  status ENUM('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO')
  prioridade ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')
  responsavel_id BIGINT (FK usuarios nullable)
  criado_em TIMESTAMP
  atualizado_em TIMESTAMP

Índices:
  - usuario_id
  - responsavel_id
  - status
  - prioridade
  - criado_em

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
  - FK responsavel_id → usuarios.id (ON DELETE SET NULL)
  - CHECK (responsavel_id IS NULL OR responsavel_id != usuario_id)
```

#### `suporte_mensagens`
```
Campos:
  id BIGINT (PK, AI)
  ticket_id BIGINT (FK suporte_tickets)
  usuario_id BIGINT (FK usuarios)
  mensagem TEXT
  criado_em TIMESTAMP

Índices:
  - ticket_id
  - usuario_id
  - criado_em

Constraints:
  - FK ticket_id → suporte_tickets.id (ON DELETE CASCADE)
  - FK usuario_id → usuarios.id (ON DELETE CASCADE)
```

#### `log_auditoria`
```
Campos:
  id BIGINT (PK, AI)
  usuario_id BIGINT (FK usuarios nullable)
  acao VARCHAR(255) (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
  tabela VARCHAR(100)
  registro_id BIGINT
  dados_anteriores LONGTEXT (JSON)
  dados_novos LONGTEXT (JSON)
  ip_address VARCHAR(45)
  user_agent VARCHAR(500)
  criado_em TIMESTAMP

Índices:
  - usuario_id
  - acao
  - tabela
  - criado_em
  - registro_id

Constraints:
  - FK usuario_id → usuarios.id (ON DELETE SET NULL)
```

---

## DIAGRAMA DE RELACIONAMENTOS

```
                                    usuarios
                                       |
                    ___________________|___________________
                    |       |      |       |       |       |
                    |       |      |       |       |       |
              sessoes_jwt  tokens  cursos  profil  admin  suport
                          recuper  (criador_id)    ops   tickets
                                    
                    cursos (1) ──── (N) modulos
                    modulos (1) ──── (N) aulas
                    aulas (1) ──── (N) aula_conteudo
                                    |           |
                                    └─ midia_videos
                                    └─ midia_pdfs

              usuario_cursos (1) ──── (N) usuario_aulas
              usuarios (N) ──── (N) cursos (through usuario_cursos)

              downloads (1) ──── (N) usuario_downloads
              usuarios (N) ──── (N) downloads (through usuario_downloads)

              cms_paginas (1) ──── (N) cms_secoes
              cms_secoes (1) ──── (N) cms_blocos_conteudo
                    |
                    └─ midia_imagens

              cms_configuracoes (referencia) midia_imagens (logo, favicon)

              suporte_tickets (1) ──── (N) suporte_mensagens
              usuarios (N) ──── (N) tickets (through suporte_tickets)

              log_auditoria (rastreia tudo)
```

---

## ÍNDICES ESTRATÉGICOS

### Performance Queries
- `usuarios(email)` - Login
- `usuarios(role)` - Filtros por permissão
- `cursos(slug)` - Rotas dinâmicas
- `usuario_cursos(usuario_id, completado)` - Dashboard
- `aulas(modulo_id, ordem)` - Listagem
- `usuario_aulas(usuario_id, assistida)` - Progresso
- `cms_configuracoes(chave)` - Configurações
- `log_auditoria(usuario_id, criado_em)` - Auditoria

### Cleanup
- `sessoes_jwt(expira_em)` - Remover sessions expiradas
- `tokens_recuperacao(expira_em)` - Remover tokens expirados

---

## CONSTRAINTS DE INTEGRIDADE

✅ FOREIGN KEYS com CASCADE/RESTRICT/SET NULL apropriados
✅ UNIQUE constraints para deduplicação
✅ CHECK constraints para validações
✅ PRIMARY KEYS de 64-bit (BIGINT) para escalabilidade
✅ TIMESTAMPS automáticos (created_at, updated_at)

---

## PRÓXIMO PASSO: PRISMA SCHEMA + MIGRATIONS

Na próxima mensagem vou entregar:
1. `/schema.prisma` - Completo e pronto para Hostinger
2. `/prisma/migrations/` - SQL migrations
3. `/prisma/seed.ts` - Seed data
4. Instruções de setup

✅ **AGUARDANDO CONFIRMAÇÃO PARA PROSSEGUIR**
