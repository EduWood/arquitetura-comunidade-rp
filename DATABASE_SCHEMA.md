# BANCO DE DADOS COMPLETO - COMUNIDADE RP

## 📊 Especificação Técnica do Banco MySQL Hostinger

**Versão:** 1.0  
**Data:** 2026  
**Status:** Pronto para Implementação  
**Banco:** MySQL 8.0+ (Hostinger)  
**ORM:** Prisma v5+  
**Encoding:** UTF8MB4  
**Collation:** utf8mb4_unicode_ci

---

## 📑 ÍNDICE

1. [Diagrama ER Textual](#1-diagrama-er-textual)
2. [Estrutura de Tabelas Completa](#2-estrutura-de-tabelas-completa)
3. [Prisma Schema Completo](#3-prisma-schema-completo)
4. [Relacionamentos Detalhados](#4-relacionamentos-detalhados)
5. [Estratégia de CMS Dinâmico](#5-estratégia-de-cms-dinâmico)
6. [Estratégia de Upload de Imagens](#6-estratégia-de-upload-de-imagens)
7. [Estratégia de Vídeos Externos](#7-estratégia-de-vídeos-externos)
8. [Estratégia de Permissões](#8-estratégia-de-permissões-de-usuário)
9. [Estratégia de SEO Dinâmico](#9-estratégia-de-seo-dinâmico)
10. [Validação de Integridade](#10-validação-de-integridade)

---

## 1. DIAGRAMA ER TEXTUAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BANCO DE DADOS - COMUNIDADE RP                      │
│                                                                               │
│  Núcleo de Usuários                                                          │
│  ════════════════════                                                        │
│  ┌──────────────────┐                                                       │
│  │     USUARIOS     │ (users)                                               │
│  ├──────────────────┤                                                       │
│  │ id (PK)          │                                                       │
│  │ email (UNIQUE)   │                                                       │
│  │ nome             │                                                       │
│  │ senha_hash       │                                                       │
│  │ foto_perfil_url  │                                                       │
│  │ bio              │                                                       │
│  │ tipo_usuario     │◄──────────────┐                                       │
│  │ status           │               │                                       │
│  │ data_cadastro    │               │                                       │
│  │ data_atualizacao │               │                                       │
│  │ verificado       │               │                                       │
│  │ data_verificacao │               │                                       │
│  │ 2fa_habilitado   │               │                                       │
│  │ telefone         │               │                                       │
│  │ pais             │               │                                       │
│  │ cidade           │               │                                       │
│  └──────────────────┘               │                                       │
│           │                         │                                       │
│           │ 1:N                     │ Enum                                  │
│           ├─────────────┬───────────┼───────────────┐                       │
│           │             │           │               │                       │
│           ▼             ▼           ▼               ▼                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │    ASSINATURAS   │  │   SESSOES_JWT    │  │   PERMISSOES     │         │
│  │  (subscriptions) │  │ (jwt_sessions)   │  │  (permissions)   │         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │ id (PK)          │  │ id (PK)          │  │ id (PK)          │         │
│  │ usuario_id (FK)  │  │ usuario_id (FK)  │  │ usuario_id (FK)  │         │
│  │ plano_id (FK)    │  │ token_hash       │  │ tipo_permissao   │         │
│  │ data_inicio      │  │ token_expirado   │  │ tabela_alvo      │         │
│  │ data_renovacao   │  │ ip_address       │  │ recurso_alvo      │         │
│  │ status           │  │ user_agent       │  │ data_criacao     │         │
│  │ cancelado_em     │  │ ativo            │  │ data_expiracao   │         │
│  │ renovacao_auto   │  │ data_criacao     │  │ ativo            │         │
│  │ metodo_pagamento │  │ ultimo_acesso    │  └──────────────────┘         │
│  └──────────────────┘  └──────────────────┘                                │
│           │                                                                 │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │      PLANOS      │                                                       │
│  │ (subscription_plans) │                                                   │
│  ├──────────────────┤                                                       │
│  │ id (PK)          │                                                       │
│  │ nome             │                                                       │
│  │ descricao        │                                                       │
│  │ preco_mensal     │                                                       │
│  │ preco_anual      │                                                       │
│  │ features_json    │                                                       │
│  │ ativo            │                                                       │
│  │ ordem_display    │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
│  Núcleo de Conteúdo                                                         │
│  ══════════════════════                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌──────────────────┐     ┌──────────────────┐                      │  │
│  │  │     CURSOS       │     │     MODULOS      │                      │  │
│  │  │    (courses)     │1:N  │   (modules)      │                      │  │
│  │  ├──────────────────┤◄────┤                  │                      │  │
│  │  │ id (PK)          │     ├──────────────────┤                      │  │
│  │  │ titulo           │     │ id (PK)          │1:N  ┌──────────────┐ │  │
│  │  │ slug             │     │ curso_id (FK)    │────►│  AULAS       │ │  │
│  │  │ descricao        │     │ titulo           │     │ (lessons)    │ │  │
│  │  │ descricao_longa  │     │ numero_ordem     │     ├──────────────┤ │  │
│  │  │ instrutor_id(FK) │     │ descricao        │     │ id (PK)      │ │  │
│  │  │ categoria        │     │ data_criacao     │     │ modulo_id(FK)│ │  │
│  │  │ preco            │     │ data_atualizacao │     │ titulo       │ │  │
│  │  │ imagem_capa      │     │ ativo            │     │ numero_ordem │ │  │
│  │  │ status           │     └──────────────────┘     │ descricao    │ │  │
│  │  │ nivel            │                              │ video_url    │ │  │
│  │  │ data_publicacao  │                              │ video_tipo   │ │  │
│  │  │ data_atualizacao │                              │ duracao      │ │  │
│  │  │ ativo            │                              │ recursos     │ │  │
│  │  └──────────────────┘                              │ data_criacao │ │  │
│  │           │                                        │ ativo        │ │  │
│  │           │ 1:N                                    └──────────────┘ │  │
│  │           │                                                        │  │
│  │           ▼                                                        │  │
│  │  ┌──────────────────────┐                                          │  │
│  │  │ USUARIO_CURSOS       │                                          │  │
│  │  │ (user_courses)       │                                          │  │
│  │  ├──────────────────────┤                                          │  │
│  │  │ id (PK)              │                                          │  │
│  │  │ usuario_id (FK)      │                                          │  │
│  │  │ curso_id (FK)        │                                          │  │
│  │  │ progresso_percentual │                                          │  │
│  │  │ aulas_assistidas     │                                          │  │
│  │  │ data_inscricao       │                                          │  │
│  │  │ data_conclusao       │                                          │  │
│  │  │ status               │                                          │  │
│  │  │ ultima_aula_assistida│                                          │  │
│  │  │ data_ultima_aula     │                                          │  │
│  │  │ certificado_gerado   │                                          │  │
│  │  │ tempo_total_minutos  │                                          │  │
│  │  └──────────────────────┘                                          │  │
│  │           │                                                        │  │
│  │           │ N:N                                                    │  │
│  │           │                                                        │  │
│  │           ▼                                                        │  │
│  │  ┌──────────────────────┐                                          │  │
│  │  │ USUARIO_AULAS        │                                          │  │
│  │  │ (user_lessons)       │                                          │  │
│  │  ├──────────────────────┤                                          │  │
│  │  │ id (PK)              │                                          │  │
│  │  │ usuario_id (FK)      │                                          │  │
│  │  │ aula_id (FK)         │                                          │  │
│  │  │ data_visualizacao    │                                          │  │
│  │  │ duracao_assistida    │                                          │  │
│  │  │ progresso_percentual │                                          │  │
│  │  │ tempo_total_minutos  │                                          │  │
│  │  │ concluida            │                                          │  │
│  │  └──────────────────────┘                                          │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de CMS                                                              │
│  ═════════════════════                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────┐      ┌──────────────────┐                    │  │
│  │  │   CMS_PAGINAS    │      │   CMS_BLOCOS     │                    │  │
│  │  │  (cms_pages)     │1:N   │  (cms_blocks)    │                    │  │
│  │  ├──────────────────┤◄─────┤                  │                    │  │
│  │  │ id (PK)          │      ├──────────────────┤                    │  │
│  │  │ titulo           │      │ id (PK)          │                    │  │
│  │  │ slug             │      │ pagina_id (FK)   │1:N ┌─────────────┐ │  │
│  │  │ tipo_pagina      │      │ tipo_bloco       │───►│  CMS_CONTEUDO│ │  │
│  │  │ meta_title       │      │ posicao_ordem    │    │ (cms_content)│ │  │
│  │  │ meta_description │      │ ativo            │    ├─────────────┤ │  │
│  │  │ meta_keywords    │      │ data_criacao     │    │ id (PK)     │ │  │
│  │  │ og_image_url     │      │ data_atualizacao │    │ bloco_id(FK)│ │  │
│  │  │ slug_url         │      └──────────────────┘    │ chave       │ │  │
│  │  │ ativo            │                              │ valor_texto │ │  │
│  │  │ data_criacao     │                              │ valor_json  │ │  │
│  │  │ data_atualizacao │                              │ tipo_campo  │ │  │
│  │  └──────────────────┘                              │ ordenacao   │ │  │
│  │                                                    │ data_criacao│ │  │
│  │  ┌──────────────────────┐                          └─────────────┘ │  │
│  │  │  CMS_CONFIGURACOES   │                                          │  │
│  │  │ (cms_configurations) │                                          │  │
│  │  ├──────────────────────┤                                          │  │
│  │  │ id (PK)              │                                          │  │
│  │  │ chave (UNIQUE)       │                                          │  │
│  │  │ valor_texto          │                                          │  │
│  │  │ valor_json           │                                          │  │
│  │  │ tipo_valor           │                                          │  │
│  │  │ descricao            │                                          │  │
│  │  │ requer_publicacao    │                                          │  │
│  │  │ data_atualizacao     │                                          │  │
│  │  └──────────────────────┘                                          │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de Mídia                                                            │
│  ═════════════════════                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────┐       ┌──────────────────┐                   │  │
│  │  │   MIDIA_IMAGENS  │       │   MIDIA_VIDEOS   │                   │  │
│  │  │  (media_images)  │       │  (media_videos)  │                   │  │
│  │  ├──────────────────┤       ├──────────────────┤                   │  │
│  │  │ id (PK)          │       │ id (PK)          │                   │  │
│  │  │ nome_arquivo     │       │ titulo           │                   │  │
│  │  │ url_publica      │       │ url_externa      │                   │  │
│  │  │ tamanho_bytes    │       │ tipo_plataforma  │                   │  │
│  │  │ largura          │       │ video_id_externo │                   │  │
│  │  │ altura           │       │ duracao_segundos │                   │  │
│  │  │ mime_type        │       │ thumbnail_url    │                   │  │
│  │  │ usuario_id (FK)  │       │ usuario_id (FK)  │                   │  │
│  │  │ data_upload      │       │ data_criacao     │                   │  │
│  │  │ uso_em           │       │ ativo            │                   │  │
│  │  └──────────────────┘       └──────────────────┘                   │  │
│  │                                                                     │  │
│  │  ┌──────────────────────┐                                          │  │
│  │  │   MIDIA_DOWNLOADS    │                                          │  │
│  │  │ (media_downloads)    │                                          │  │
│  │  ├──────────────────────┤                                          │  │
│  │  │ id (PK)              │                                          │  │
│  │  │ nome_arquivo         │                                          │  │
│  │  │ url_download         │                                          │  │
│  │  │ tamanho_bytes        │                                          │  │
│  │  │ tipo_arquivo         │                                          │  │
│  │  │ curso_id (FK)        │                                          │  │
│  │  │ usuario_id_criador   │                                          │  │
│  │  │ data_criacao         │                                          │  │
│  │  │ ativo                │                                          │  │
│  │  └──────────────────────┘                                          │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de Comunidade                                                       │
│  ═════════════════════                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────┐                                           │  │
│  │  │  COMUNIDADE_POSTS    │                                           │  │
│  │  │ (community_posts)    │                                           │  │
│  │  ├──────────────────────┤                                           │  │
│  │  │ id (PK)              │1:N  ┌─────────────────────┐               │  │
│  │  │ usuario_id (FK)      │────►│  COMUNIDADE_COMENTARIOS │            │  │
│  │  │ conteudo             │     │ (community_comments)  │              │  │
│  │  │ imagem_url (opcional)│     ├─────────────────────┤              │  │
│  │  │ video_url (opcional) │     │ id (PK)             │              │  │
│  │  │ curtidas_count       │     │ post_id (FK)        │              │  │
│  │  │ comentarios_count    │     │ usuario_id (FK)     │              │  │
│  │  │ compartilhas_count   │     │ comentario_pai_id   │              │  │
│  │  │ data_criacao         │     │ conteudo            │              │  │
│  │  │ data_atualizacao     │     │ curtidas_count      │              │  │
│  │  │ ativo                │     │ data_criacao        │              │  │
│  │  └──────────────────────┘     │ ativo               │              │  │
│  │                               └─────────────────────┘              │  │
│  │  ┌──────────────────────┐                                          │  │
│  │  │  COMUNIDADE_REACOES  │                                          │  │
│  │  │ (community_reactions)│                                          │  │
│  │  ├──────────────────────┤                                          │  │
│  │  │ id (PK)              │                                          │  │
│  │  │ usuario_id (FK)      │                                          │  │
│  │  │ post_id (FK)         │                                          │  │
│  │  │ comentario_id (FK)   │                                          │  │
│  │  │ tipo_reacao          │                                          │  │
│  │  │ data_criacao         │                                          │  │
│  │  └──────────────────────┘                                          │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de Operações                                                        │
│  ══════════════════════                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────┐                                       │  │
│  │  │  OPERACOES_AO_VIVO       │                                       │  │
│  │  │ (live_operations)        │                                       │  │
│  │  ├──────────────────────────┤                                       │  │
│  │  │ id (PK)                  │                                       │  │
│  │  │ titulo                   │1:N ┌────────────────────────┐        │  │
│  │  │ descricao                │───►│ OPERACOES_TRADES       │        │  │
│  │  │ data_inicio              │    │ (live_operation_trades)│        │  │
│  │  │ data_fim                 │    ├────────────────────────┤        │  │
│  │  │ status                   │    │ id (PK)                │        │  │
│  │  │ url_transmissao          │    │ operacao_id (FK)       │        │  │
│  │  │ usuario_criador_id (FK)  │    │ ativo_ticker           │        │  │
│  │  │ data_criacao             │    │ tipo_operacao          │        │  │
│  │  │ data_atualizacao         │    │ preco_entrada          │        │  │
│  │  │ ativo                    │    │ preco_saida            │        │  │
│  │  └──────────────────────────┘    │ resultado              │        │  │
│  │                                  │ data_execucao          │        │  │
│  │  ┌──────────────────────────┐    │ ativo                  │        │  │
│  │  │  OPERACOES_REPLAYS       │    └────────────────────────┘        │  │
│  │  │ (live_operation_replays) │                                      │  │
│  │  ├──────────────────────────┤                                      │  │
│  │  │ id (PK)                  │                                      │  │
│  │  │ operacao_id (FK)         │                                      │  │
│  │  │ url_video_gravacao       │                                      │  │
│  │  │ data_disponivel_desde    │                                      │  │
│  │  │ data_criacao             │                                      │  │
│  │  │ ativo                    │                                      │  │
│  │  └──────────────────────────┘                                      │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de Pagamentos & Auditoria                                           │
│  ═════════════════════════════════                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────┐   ┌──────────────────────┐                │  │
│  │  │   PAGAMENTOS         │   │    FATURAS           │                │  │
│  │  │  (payments)          │1:N│  (invoices)          │                │  │
│  │  ├──────────────────────┤◄──┤                      │                │  │
│  │  │ id (PK)              │   ├──────────────────────┤                │  │
│  │  │ usuario_id (FK)      │   │ id (PK)              │                │  │
│  │  │ assinatura_id (FK)   │   │ pagamento_id (FK)    │                │  │
│  │  │ valor                │   │ numero_fatura        │                │  │
│  │  │ moeda                │   │ valor                │                │  │
│  │  │ gateway_pagamento    │   │ data_emissao         │                │  │
│  │  │ id_transacao_externo │   │ data_vencimento      │                │  │
│  │  │ status_pagamento     │   │ status               │                │  │
│  │  │ metodo_pagamento     │   │ url_download         │                │  │
│  │  │ data_pagamento       │   │ data_criacao         │                │  │
│  │  │ data_proxima_tentativa   │ ativo                │                │  │
│  │  │ data_criacao         │   └──────────────────────┘                │  │
│  │  │ data_atualizacao     │                                           │  │
│  │  │ ativo                │   ┌──────────────────────┐                │  │
│  │  └──────────────────────┘   │  LOG_AUDITORIA       │                │  │
│  │                             │  (audit_logs)       │                │  │
│  │  ┌──────────────────────┐   ├──────────────────────┤                │  │
│  │  │  WEBHOOKS_LOG        │   │ id (PK)              │                │  │
│  │  │ (webhooks_log)       │   │ usuario_id (FK)      │                │  │
│  │  ├──────────────────────┤   │ tipo_acao            │                │  │
│  │  │ id (PK)              │   │ tabela_afetada       │                │  │
│  │  │ origem_webhook       │   │ registro_id          │                │  │
│  │  │ dados_recebidos      │   │ valores_antigos      │                │  │
│  │  │ status_resposta      │   │ valores_novos        │                │  │
│  │  │ data_recebimento     │   │ ip_address           │                │  │
│  │  │ tentativas           │   │ user_agent           │                │  │
│  │  │ proxima_tentativa    │   │ data_criacao         │                │  │
│  │  │ ativo                │   └──────────────────────┘                │  │
│  │  └──────────────────────┘                                           │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Núcleo de Suporte                                                          │
│  ══════════════════                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────┐                                           │  │
│  │  │  SUPORTE_TICKETS     │                                           │  │
│  │  │ (support_tickets)    │1:N ┌──────────────────────┐               │  │
│  │  ├──────────────────────┤───►│ SUPORTE_MENSAGENS    │               │  │
│  │  │ id (PK)              │    │ (support_messages)   │               │  │
│  │  │ usuario_id (FK)      │    ├──────────────────────┤               │  │
│  │  │ titulo               │    │ id (PK)              │               │  │
│  │  │ descricao            │    │ ticket_id (FK)       │               │  │
│  │  │ status               │    │ usuario_id (FK)      │               │  │
│  │  │ prioridade           │    │ mensagem             │               │  │
│  │  │ categoria            │    │ arquivo_anexo        │               │  │
│  │  │ atendente_id (FK)    │    │ data_criacao         │               │  │
│  │  │ data_criacao         │    │ ativo                │               │  │
│  │  │ data_atualizacao     │    └──────────────────────┘               │  │
│  │  │ data_resolucao       │                                           │  │
│  │  │ ativo                │                                           │  │
│  │  └──────────────────────┘                                           │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUTURA DE TABELAS COMPLETA

### 2.1 Tabela USUARIOS (users)

```sql
CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  
  -- Autenticação
  email VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci COMMENT 'Email único',
  senha_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hash',
  
  -- Informações Pessoais
  nome VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci COMMENT 'Nome completo',
  foto_perfil_url VARCHAR(500) COMMENT 'URL da foto de perfil',
  bio TEXT COLLATE utf8mb4_unicode_ci COMMENT 'Biografia do usuário',
  
  -- Status e Tipo
  tipo_usuario ENUM('admin', 'moderador', 'instrutor', 'membro_premium', 'membro_basico', 'visitante') 
    NOT NULL DEFAULT 'membro_basico' COMMENT 'Tipo de usuário',
  status ENUM('ativo', 'inativo', 'bloqueado', 'suspenso', 'deletado_pendente') 
    NOT NULL DEFAULT 'ativo' COMMENT 'Status da conta',
  
  -- Verificação
  verificado BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Email verificado',
  data_verificacao DATETIME COMMENT 'Data da verificação de email',
  
  -- Segurança
  2fa_habilitado BOOLEAN NOT NULL DEFAULT FALSE COMMENT '2FA habilitado',
  2fa_secret VARCHAR(255) COMMENT 'Secret do Google Authenticator',
  
  -- Informações de Contato
  telefone VARCHAR(20) COMMENT 'Número de telefone',
  
  -- Localização
  pais VARCHAR(2) COMMENT 'Código do país (ISO 3166-1 alpha-2)',
  cidade VARCHAR(100) COLLATE utf8mb4_unicode_ci COMMENT 'Cidade',
  
  -- Timestamps
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  data_ultimo_acesso DATETIME COMMENT 'Último acesso ao sistema',
  
  -- Índices
  INDEX idx_email (email),
  INDEX idx_tipo_usuario (tipo_usuario),
  INDEX idx_status (status),
  INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 Tabela ASSINATURAS (subscriptions)

```sql
CREATE TABLE assinaturas (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL COMMENT 'Referência ao usuário',
  plano_id CHAR(36) NOT NULL COMMENT 'Referência ao plano',
  
  -- Datas
  data_inicio DATE NOT NULL COMMENT 'Data de início da assinatura',
  data_renovacao DATE NOT NULL COMMENT 'Data de próxima renovação',
  
  -- Status
  status ENUM('ativa', 'expirada', 'cancelada', 'pendente_pagamento', 'suspensa') 
    NOT NULL DEFAULT 'ativa' COMMENT 'Status da assinatura',
  cancelado_em DATETIME COMMENT 'Data de cancelamento',
  
  -- Configurações
  renovacao_auto BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Renovação automática',
  metodo_pagamento VARCHAR(50) COMMENT 'Método de pagamento (credit_card, pix, boleto)',
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (plano_id) REFERENCES planos(id),
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_status (status),
  INDEX idx_data_renovacao (data_renovacao),
  INDEX idx_data_criacao (data_criacao),
  
  UNIQUE KEY unique_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Tabela PLANOS (subscription_plans)

```sql
CREATE TABLE planos (
  id CHAR(36) PRIMARY KEY,
  
  -- Informações
  nome VARCHAR(100) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
  descricao TEXT COLLATE utf8mb4_unicode_ci,
  
  -- Preços
  preco_mensal DECIMAL(10, 2) NOT NULL COMMENT 'Preço mensal em BRL',
  preco_anual DECIMAL(10, 2) COMMENT 'Preço anual em BRL (com desconto)',
  
  -- Features (JSON)
  features_json JSON NOT NULL COMMENT 'Lista de features do plano',
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem_display INT DEFAULT 0 COMMENT 'Ordem de exibição',
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_ativo (ativo),
  INDEX idx_ordem_display (ordem_display)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exemplo de features_json:**
```json
{
  "cursos_ilimitados": true,
  "grupo_vip": true,
  "operacoes_ao_vivo": true,
  "copy_trader": true,
  "ia_analises": true,
  "forex_analises": true,
  "downloads_ilimitados": true,
  "suporte_prioritario": true,
  "certificados": true,
  "maximo_usuarios": 1,
  "limite_requisicoes_ia": 100
}
```

### 2.4 Tabela SESSOES_JWT (jwt_sessions)

```sql
CREATE TABLE sessoes_jwt (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  
  -- Token
  token_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'Hash SHA256 do token',
  
  -- Expiração
  token_expirado BOOLEAN NOT NULL DEFAULT FALSE,
  data_expiracao DATETIME NOT NULL,
  
  -- Rastreamento
  ip_address VARCHAR(45) COMMENT 'IPv4 ou IPv6',
  user_agent VARCHAR(500) COMMENT 'User agent do navegador',
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_data_expiracao (data_expiracao),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.5 Tabela PERMISSOES (permissions)

```sql
CREATE TABLE permissoes (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  
  -- Permissão
  tipo_permissao VARCHAR(100) NOT NULL COMMENT 'Ex: view_course, edit_course, delete_user',
  
  -- Escopo
  tabela_alvo VARCHAR(100) COMMENT 'Tabela alvo (ex: cursos)',
  recurso_alvo CHAR(36) COMMENT 'ID do recurso específico (deixar NULL para permissão global)',
  
  -- Validade
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_expiracao DATETIME COMMENT 'NULL = sem expiração',
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_tipo_permissao (tipo_permissao),
  INDEX idx_data_expiracao (data_expiracao),
  INDEX idx_ativo (ativo),
  
  UNIQUE KEY unique_permissao (usuario_id, tipo_permissao, tabela_alvo, recurso_alvo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.6 Tabela CURSOS (courses)

```sql
CREATE TABLE cursos (
  id CHAR(36) PRIMARY KEY,
  
  -- Informações Básicas
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  slug VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
  descricao TEXT COLLATE utf8mb4_unicode_ci,
  descricao_longa LONGTEXT COLLATE utf8mb4_unicode_ci,
  
  -- Instrutor
  instrutor_id CHAR(36) NOT NULL,
  
  -- Categorização
  categoria VARCHAR(100) COLLATE utf8mb4_unicode_ci,
  
  -- Preço
  preco DECIMAL(10, 2) COMMENT 'Preço do curso (opcional, pode ser incluído em plano)',
  
  -- Mídia
  imagem_capa VARCHAR(500),
  
  -- Status
  status ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'rascunho',
  
  -- Metadados
  nivel ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'intermediario',
  
  -- Timestamps
  data_publicacao DATETIME,
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (instrutor_id) REFERENCES usuarios(id),
  
  INDEX idx_slug (slug),
  INDEX idx_instrutor_id (instrutor_id),
  INDEX idx_categoria (categoria),
  INDEX idx_status (status),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.7 Tabela MODULOS (modules)

```sql
CREATE TABLE modulos (
  id CHAR(36) PRIMARY KEY,
  
  curso_id CHAR(36) NOT NULL,
  
  -- Informações
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  numero_ordem INT NOT NULL COMMENT 'Ordem de exibição',
  descricao TEXT COLLATE utf8mb4_unicode_ci,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  
  INDEX idx_curso_id (curso_id),
  INDEX idx_numero_ordem (numero_ordem),
  INDEX idx_ativo (ativo),
  
  UNIQUE KEY unique_curso_modulo (curso_id, numero_ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.8 Tabela AULAS (lessons)

```sql
CREATE TABLE aulas (
  id CHAR(36) PRIMARY KEY,
  
  modulo_id CHAR(36) NOT NULL,
  
  -- Informações
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  numero_ordem INT NOT NULL,
  descricao TEXT COLLATE utf8mb4_unicode_ci,
  
  -- Vídeo
  video_url VARCHAR(500) COMMENT 'URL do vídeo externo ou ID',
  video_tipo ENUM('youtube', 'vimeo', 'bunny', 'upload_direto') COMMENT 'Tipo de vídeo',
  duracao_minutos INT COMMENT 'Duração em minutos',
  
  -- Recursos
  recursos JSON COMMENT 'Links para materiais, PDFs, etc',
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
  
  INDEX idx_modulo_id (modulo_id),
  INDEX idx_numero_ordem (numero_ordem),
  INDEX idx_ativo (ativo),
  
  UNIQUE KEY unique_modulo_aula (modulo_id, numero_ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.9 Tabela USUARIO_CURSOS (user_courses)

```sql
CREATE TABLE usuario_cursos (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  curso_id CHAR(36) NOT NULL,
  
  -- Progresso
  progresso_percentual DECIMAL(5, 2) DEFAULT 0 COMMENT '0-100%',
  aulas_assistidas INT DEFAULT 0,
  
  -- Status
  status ENUM('inscrito', 'em_andamento', 'concluido', 'abandonado') 
    NOT NULL DEFAULT 'inscrito',
  
  -- Rastreamento
  data_inscricao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_conclusao DATETIME,
  ultima_aula_assistida CHAR(36) COMMENT 'ID da última aula assistida',
  data_ultima_aula DATETIME,
  
  -- Certificado
  certificado_gerado BOOLEAN DEFAULT FALSE,
  
  -- Tempo
  tempo_total_minutos INT DEFAULT 0 COMMENT 'Tempo total gasto no curso',
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_curso_id (curso_id),
  INDEX idx_status (status),
  INDEX idx_progresso_percentual (progresso_percentual),
  
  UNIQUE KEY unique_usuario_curso (usuario_id, curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.10 Tabela USUARIO_AULAS (user_lessons)

```sql
CREATE TABLE usuario_aulas (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  aula_id CHAR(36) NOT NULL,
  
  -- Rastreamento
  data_visualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duracao_assistida_minutos INT DEFAULT 0 COMMENT 'Duração assistida em minutos',
  progresso_percentual DECIMAL(5, 2) DEFAULT 0 COMMENT 'Progresso do vídeo 0-100%',
  
  -- Status
  concluida BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  data_conclusao DATETIME,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_aula_id (aula_id),
  INDEX idx_data_visualizacao (data_visualizacao),
  
  UNIQUE KEY unique_usuario_aula (usuario_id, aula_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.11 Tabela CMS_PAGINAS (cms_pages)

```sql
CREATE TABLE cms_paginas (
  id CHAR(36) PRIMARY KEY,
  
  -- Identificação
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  slug VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
  
  -- Tipo
  tipo_pagina ENUM('home', 'sobre', 'beneficios', 'rodape', 'banner', 'customizada') 
    NOT NULL DEFAULT 'customizada',
  
  -- SEO
  meta_title VARCHAR(255) COLLATE utf8mb4_unicode_ci,
  meta_description VARCHAR(500) COLLATE utf8mb4_unicode_ci,
  meta_keywords VARCHAR(500) COLLATE utf8mb4_unicode_ci,
  og_image_url VARCHAR(500),
  
  -- URL
  slug_url VARCHAR(500) COLLATE utf8mb4_unicode_ci,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_tipo_pagina (tipo_pagina),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.12 Tabela CMS_BLOCOS (cms_blocks)

```sql
CREATE TABLE cms_blocos (
  id CHAR(36) PRIMARY KEY,
  
  pagina_id CHAR(36) NOT NULL,
  
  -- Tipo
  tipo_bloco VARCHAR(100) NOT NULL COMMENT 'hero, features, testimonials, faq, cta, etc',
  
  -- Posição
  posicao_ordem INT NOT NULL,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pagina_id) REFERENCES cms_paginas(id) ON DELETE CASCADE,
  
  INDEX idx_pagina_id (pagina_id),
  INDEX idx_tipo_bloco (tipo_bloco),
  INDEX idx_posicao_ordem (posicao_ordem),
  
  UNIQUE KEY unique_pagina_bloco (pagina_id, posicao_ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.13 Tabela CMS_CONTEUDO (cms_content)

```sql
CREATE TABLE cms_conteudo (
  id CHAR(36) PRIMARY KEY,
  
  bloco_id CHAR(36) NOT NULL,
  
  -- Campo
  chave VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci COMMENT 'Campo (ex: titulo, descricao)',
  
  -- Valores
  valor_texto LONGTEXT COLLATE utf8mb4_unicode_ci COMMENT 'Texto ou HTML',
  valor_json JSON COMMENT 'Para dados estruturados',
  
  -- Tipo
  tipo_campo ENUM('texto', 'textarea', 'html', 'numero', 'boolean', 'json', 'imagem', 'video') 
    NOT NULL DEFAULT 'texto',
  
  -- Ordem
  ordenacao INT DEFAULT 0,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (bloco_id) REFERENCES cms_blocos(id) ON DELETE CASCADE,
  
  INDEX idx_bloco_id (bloco_id),
  INDEX idx_chave (chave),
  
  UNIQUE KEY unique_bloco_chave (bloco_id, chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.14 Tabela CMS_CONFIGURACOES (cms_configurations)

```sql
CREATE TABLE cms_configuracoes (
  id CHAR(36) PRIMARY KEY,
  
  -- Identificação
  chave VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci COMMENT 'Ex: logo_url, favicon_url',
  
  -- Valores
  valor_texto VARCHAR(500),
  valor_json JSON,
  
  -- Tipo
  tipo_valor ENUM('texto', 'url', 'numero', 'json', 'boolean') NOT NULL DEFAULT 'texto',
  
  -- Descrição
  descricao VARCHAR(500) COLLATE utf8mb4_unicode_ci,
  
  -- Publicação
  requer_publicacao BOOLEAN DEFAULT FALSE COMMENT 'Requer publicação para ir ao vivo',
  
  -- Timestamps
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_chave (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.15 Tabela MIDIA_IMAGENS (media_images)

```sql
CREATE TABLE midia_imagens (
  id CHAR(36) PRIMARY KEY,
  
  -- Arquivo
  nome_arquivo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  url_publica VARCHAR(500) NOT NULL,
  
  -- Informações do arquivo
  tamanho_bytes INT NOT NULL,
  
  -- Dimensões
  largura INT,
  altura INT,
  
  -- Tipo MIME
  mime_type VARCHAR(50) NOT NULL,
  
  -- Proprietário
  usuario_id CHAR(36),
  
  -- Uso
  uso_em VARCHAR(100) COMMENT 'logo, favicon, banner, testimonialsm etc',
  
  -- Timestamps
  data_upload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_upload (data_upload),
  INDEX idx_uso_em (uso_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.16 Tabela MIDIA_VIDEOS (media_videos)

```sql
CREATE TABLE midia_videos (
  id CHAR(36) PRIMARY KEY,
  
  -- Informações
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  
  -- Link externo
  url_externa VARCHAR(500) NOT NULL,
  tipo_plataforma ENUM('youtube', 'vimeo', 'bunny', 'outro') NOT NULL DEFAULT 'youtube',
  video_id_externo VARCHAR(255) COMMENT 'ID do vídeo na plataforma',
  
  -- Metadados
  duracao_segundos INT,
  thumbnail_url VARCHAR(500),
  
  -- Proprietário
  usuario_id CHAR(36),
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_criacao (data_criacao),
  INDEX idx_tipo_plataforma (tipo_plataforma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.17 Tabela MIDIA_DOWNLOADS (media_downloads)

```sql
CREATE TABLE midia_downloads (
  id CHAR(36) PRIMARY KEY,
  
  -- Arquivo
  nome_arquivo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  url_download VARCHAR(500) NOT NULL,
  tamanho_bytes INT NOT NULL,
  tipo_arquivo VARCHAR(50) COMMENT 'pdf, zip, xls, etc',
  
  -- Relacionamento
  curso_id CHAR(36),
  usuario_id_criador CHAR(36),
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id_criador) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_curso_id (curso_id),
  INDEX idx_usuario_id_criador (usuario_id_criador),
  INDEX idx_data_criacao (data_criacao),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.18 Tabela COMUNIDADE_POSTS (community_posts)

```sql
CREATE TABLE comunidade_posts (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  
  -- Conteúdo
  conteudo TEXT NOT NULL COLLATE utf8mb4_unicode_ci,
  imagem_url VARCHAR(500),
  video_url VARCHAR(500),
  
  -- Engajamento
  curtidas_count INT DEFAULT 0,
  comentarios_count INT DEFAULT 0,
  compartilhas_count INT DEFAULT 0,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_criacao (data_criacao),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.19 Tabela COMUNIDADE_COMENTARIOS (community_comments)

```sql
CREATE TABLE comunidade_comentarios (
  id CHAR(36) PRIMARY KEY,
  
  post_id CHAR(36) NOT NULL,
  usuario_id CHAR(36) NOT NULL,
  comentario_pai_id CHAR(36) COMMENT 'Para replies aninhadas',
  
  -- Conteúdo
  conteudo TEXT NOT NULL COLLATE utf8mb4_unicode_ci,
  
  -- Engajamento
  curtidas_count INT DEFAULT 0,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (post_id) REFERENCES comunidade_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (comentario_pai_id) REFERENCES comunidade_comentarios(id) ON DELETE CASCADE,
  
  INDEX idx_post_id (post_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_criacao (data_criacao),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.20 Tabela COMUNIDADE_REACOES (community_reactions)

```sql
CREATE TABLE comunidade_reacoes (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  post_id CHAR(36),
  comentario_id CHAR(36),
  
  -- Tipo de reação
  tipo_reacao ENUM('curtida', 'amei', 'adorei', 'haha', 'uau', 'triste', 'raiva') 
    NOT NULL DEFAULT 'curtida',
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES comunidade_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comentario_id) REFERENCES comunidade_comentarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_post_id (post_id),
  INDEX idx_comentario_id (comentario_id),
  
  UNIQUE KEY unique_reacao (usuario_id, COALESCE(post_id, 0), COALESCE(comentario_id, 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.21 Tabela OPERACOES_AO_VIVO (live_operations)

```sql
CREATE TABLE operacoes_ao_vivo (
  id CHAR(36) PRIMARY KEY,
  
  -- Informações
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  descricao TEXT COLLATE utf8mb4_unicode_ci,
  
  -- Datas
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  
  -- Status
  status ENUM('agendada', 'ao_vivo', 'finalizada', 'cancelada') 
    NOT NULL DEFAULT 'agendada',
  
  -- Transmissão
  url_transmissao VARCHAR(500) COMMENT 'URL do YouTube Live ou similar',
  
  -- Criador
  usuario_criador_id CHAR(36) NOT NULL,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_criador_id (usuario_criador_id),
  INDEX idx_status (status),
  INDEX idx_data_inicio (data_inicio),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.22 Tabela OPERACOES_TRADES (live_operation_trades)

```sql
CREATE TABLE operacoes_trades (
  id CHAR(36) PRIMARY KEY,
  
  operacao_id CHAR(36) NOT NULL,
  
  -- Ativo
  ativo_ticker VARCHAR(10) NOT NULL COMMENT 'PETR4, WINZ23, etc',
  
  -- Operação
  tipo_operacao ENUM('compra', 'venda', 'call', 'put') NOT NULL,
  
  -- Preços
  preco_entrada DECIMAL(10, 4) NOT NULL,
  preco_saida DECIMAL(10, 4),
  
  -- Resultado
  resultado ENUM('win', 'loss', 'parcial', 'pendente') DEFAULT 'pendente',
  
  -- Execução
  data_execucao DATETIME,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (operacao_id) REFERENCES operacoes_ao_vivo(id) ON DELETE CASCADE,
  
  INDEX idx_operacao_id (operacao_id),
  INDEX idx_ativo_ticker (ativo_ticker),
  INDEX idx_resultado (resultado),
  INDEX idx_data_execucao (data_execucao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.23 Tabela OPERACOES_REPLAYS (live_operation_replays)

```sql
CREATE TABLE operacoes_replays (
  id CHAR(36) PRIMARY KEY,
  
  operacao_id CHAR(36) NOT NULL,
  
  -- Vídeo
  url_video_gravacao VARCHAR(500) NOT NULL,
  
  -- Disponibilidade
  data_disponivel_desde DATETIME NOT NULL,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (operacao_id) REFERENCES operacoes_ao_vivo(id) ON DELETE CASCADE,
  
  INDEX idx_operacao_id (operacao_id),
  INDEX idx_data_disponivel_desde (data_disponivel_desde),
  
  UNIQUE KEY unique_operacao_replay (operacao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.24 Tabela PAGAMENTOS (payments)

```sql
CREATE TABLE pagamentos (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  assinatura_id CHAR(36),
  
  -- Valor
  valor DECIMAL(10, 2) NOT NULL,
  moeda VARCHAR(3) NOT NULL DEFAULT 'BRL',
  
  -- Gateway
  gateway_pagamento VARCHAR(50) COMMENT 'stripe, pagarme, mercadopago',
  id_transacao_externo VARCHAR(255) UNIQUE,
  
  -- Status
  status_pagamento ENUM('pendente', 'processando', 'aprovado', 'recusado', 'expirado', 'cancelado') 
    NOT NULL DEFAULT 'pendente',
  
  -- Método
  metodo_pagamento VARCHAR(50) COMMENT 'credit_card, pix, boleto, transferencia',
  
  -- Datas
  data_pagamento DATETIME,
  data_proxima_tentativa DATETIME,
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE SET NULL,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_assinatura_id (assinatura_id),
  INDEX idx_status_pagamento (status_pagamento),
  INDEX idx_data_pagamento (data_pagamento),
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.25 Tabela FATURAS (invoices)

```sql
CREATE TABLE faturas (
  id CHAR(36) PRIMARY KEY,
  
  pagamento_id CHAR(36) NOT NULL,
  
  -- Fatura
  numero_fatura VARCHAR(50) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
  valor DECIMAL(10, 2) NOT NULL,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE,
  
  -- Status
  status ENUM('emitida', 'paga', 'vencida', 'cancelada') NOT NULL DEFAULT 'emitida',
  
  -- URL
  url_download VARCHAR(500) COMMENT 'URL para download do PDF',
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id) ON DELETE CASCADE,
  
  INDEX idx_pagamento_id (pagamento_id),
  INDEX idx_status (status),
  INDEX idx_data_emissao (data_emissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.26 Tabela LOG_AUDITORIA (audit_logs)

```sql
CREATE TABLE log_auditoria (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36),
  
  -- Ação
  tipo_acao VARCHAR(100) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc',
  
  -- Alvo
  tabela_afetada VARCHAR(100) NOT NULL,
  registro_id CHAR(36),
  
  -- Valores
  valores_antigos JSON COMMENT 'Valores antes da alteração',
  valores_novos JSON COMMENT 'Valores após alteração',
  
  -- IP e User Agent
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_tipo_acao (tipo_acao),
  INDEX idx_tabela_afetada (tabela_afetada),
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.27 Tabela WEBHOOKS_LOG (webhooks_log)

```sql
CREATE TABLE webhooks_log (
  id CHAR(36) PRIMARY KEY,
  
  -- Origem
  origem_webhook VARCHAR(100) NOT NULL COMMENT 'stripe, pagarme, etc',
  
  -- Dados
  dados_recebidos JSON NOT NULL,
  
  -- Resposta
  status_resposta INT,
  
  -- Timestamps
  data_recebimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Retry
  tentativas INT DEFAULT 1,
  proxima_tentativa DATETIME,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  INDEX idx_origem_webhook (origem_webhook),
  INDEX idx_data_recebimento (data_recebimento),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.28 Tabela SUPORTE_TICKETS (support_tickets)

```sql
CREATE TABLE suporte_tickets (
  id CHAR(36) PRIMARY KEY,
  
  usuario_id CHAR(36) NOT NULL,
  
  -- Ticket
  titulo VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  descricao TEXT NOT NULL COLLATE utf8mb4_unicode_ci,
  
  -- Status e Prioridade
  status ENUM('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado') 
    NOT NULL DEFAULT 'aberto',
  prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
  
  -- Categoria
  categoria VARCHAR(100) COMMENT 'tecnico, cobranca, conteudo, etc',
  
  -- Atendimento
  atendente_id CHAR(36) COMMENT 'ID do admin/suporte que está atendendo',
  
  -- Datas
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  data_resolucao DATETIME,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (atendente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_atendente_id (atendente_id),
  INDEX idx_status (status),
  INDEX idx_prioridade (prioridade),
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.29 Tabela SUPORTE_MENSAGENS (support_messages)

```sql
CREATE TABLE suporte_mensagens (
  id CHAR(36) PRIMARY KEY,
  
  ticket_id CHAR(36) NOT NULL,
  usuario_id CHAR(36) NOT NULL,
  
  -- Conteúdo
  mensagem TEXT NOT NULL COLLATE utf8mb4_unicode_ci,
  arquivo_anexo VARCHAR(500),
  
  -- Timestamps
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (ticket_id) REFERENCES suporte_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. PRISMA SCHEMA COMPLETO

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// NÚCLEO DE USUÁRIOS
// ============================================================================

model Usuario {
  id                    String   @id @default(cuid())
  
  // Autenticação
  email                 String   @unique
  senhaHash             String   @map("senha_hash")
  
  // Informações Pessoais
  nome                  String
  fotoPerfil            String?  @map("foto_perfil_url")
  bio                   String?  @db.Text
  
  // Status e Tipo
  tipoUsuario           TipoUsuario @default(MEMBRO_BASICO) @map("tipo_usuario")
  status                StatusUsuario @default(ATIVO)
  
  // Verificação
  verificado            Boolean  @default(false)
  dataVerificacao       DateTime? @map("data_verificacao")
  
  // Segurança
  doisFaHabilitado      Boolean  @default(false) @map("2fa_habilitado")
  doisFaSecret          String?  @map("2fa_secret")
  
  // Informações de Contato
  telefone              String?
  
  // Localização
  pais                  String?  @db.Char(2)
  cidade                String?
  
  // Timestamps
  dataCadastro          DateTime @default(now()) @map("data_cadastro")
  dataAtualizacao       DateTime @updatedAt @map("data_atualizacao")
  dataUltimoAcesso      DateTime? @map("data_ultimo_acesso")
  
  // Relacionamentos
  assinatura            Assinatura?
  sessoes               SessaoJWT[]
  permissoes            Permissao[]
  cursosInstruidos      Curso[] @relation("InstructorCourses")
  usuarioCursos         UsuarioCurso[]
  usuarioAulas          UsuarioAula[]
  postsComunidade       PostComunidade[]
  comentariosComunidade ComentarioComunidade[]
  reacoesComunidade     ReacaoComunidade[]
  operacoesCriadas      OperacaoAoVivo[] @relation("CreatorOperations")
  imagensMidia          MidiaImagem[]
  videosMidia           MidiaVideo[]
  downloadsMidia        MidiaDownload[] @relation("CreatorDownloads")
  pagamentos            Pagamento[]
  ticketsSuporteCriados TicketSuporte[]
  ticketSuporteAtendidos TicketSuporte[] @relation("AttendantTickets")
  mensagensSuporte      MensagemSuporte[]
  logAuditoria          LogAuditoria[]

  @@index([email])
  @@index([tipoUsuario])
  @@index([status])
  @@index([dataCadastro])
  @@map("usuarios")
}

enum TipoUsuario {
  ADMIN              @map("admin")
  MODERADOR          @map("moderador")
  INSTRUTOR          @map("instrutor")
  MEMBRO_PREMIUM     @map("membro_premium")
  MEMBRO_BASICO      @map("membro_basico")
  VISITANTE          @map("visitante")
}

enum StatusUsuario {
  ATIVO              @map("ativo")
  INATIVO            @map("inativo")
  BLOQUEADO          @map("bloqueado")
  SUSPENSO           @map("suspenso")
  DELETADO_PENDENTE  @map("deletado_pendente")
}

model Assinatura {
  id                String   @id @default(cuid())
  
  usuarioId         String   @unique @map("usuario_id")
  planoId           String   @map("plano_id")
  
  // Datas
  dataInicio        Date     @map("data_inicio")
  dataRenovacao     Date     @map("data_renovacao")
  
  // Status
  status            StatusAssinatura @default(ATIVA)
  canceladoEm       DateTime? @map("cancelado_em")
  
  // Configurações
  renovacaoAuto     Boolean  @default(true) @map("renovacao_auto")
  metodoPagamento   String?  @map("metodo_pagamento")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  plano             Plano    @relation(fields: [planoId], references: [id])
  pagamentos        Pagamento[]

  @@index([usuarioId])
  @@index([status])
  @@index([dataRenovacao])
  @@map("assinaturas")
}

enum StatusAssinatura {
  ATIVA              @map("ativa")
  EXPIRADA           @map("expirada")
  CANCELADA          @map("cancelada")
  PENDENTE_PAGAMENTO @map("pendente_pagamento")
  SUSPENSA           @map("suspensa")
}

model Plano {
  id                String   @id @default(cuid())
  
  // Informações
  nome              String   @unique
  descricao         String?  @db.Text
  
  // Preços
  precoMensal       Decimal  @db.Decimal(10, 2) @map("preco_mensal")
  precoAnual        Decimal? @db.Decimal(10, 2) @map("preco_anual")
  
  // Features
  featuresJson      String   @db.Json @map("features_json")
  
  // Status
  ativo             Boolean  @default(true)
  ordemDisplay      Int      @default(0) @map("ordem_display")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  assinaturas       Assinatura[]

  @@index([ativo])
  @@index([ordemDisplay])
  @@map("planos")
}

model SessaoJWT {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  
  // Token
  tokenHash         String   @unique @map("token_hash")
  
  // Expiração
  tokenExpirado      Boolean  @default(false) @map("token_expirado")
  dataExpiracao     DateTime @map("data_expiracao")
  
  // Rastreamento
  ipAddress         String?  @map("ip_address")
  userAgent         String?  @map("user_agent")
  
  // Status
  ativo             Boolean  @default(true)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  ultimoAcesso      DateTime @default(now()) @map("ultimo_acesso")
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([usuarioId])
  @@index([tokenHash])
  @@index([dataExpiracao])
  @@index([ativo])
  @@map("sessoes_jwt")
}

model Permissao {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  
  // Permissão
  tipoPermissao     String   @map("tipo_permissao")
  
  // Escopo
  tabelaAlvo        String?  @map("tabela_alvo")
  recursoAlvo       String?  @map("recurso_alvo")
  
  // Validade
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataExpiracao     DateTime? @map("data_expiracao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@unique([usuarioId, tipoPermissao, tabelaAlvo, recursoAlvo])
  @@index([usuarioId])
  @@index([tipoPermissao])
  @@index([dataExpiracao])
  @@index([ativo])
  @@map("permissoes")
}

// ============================================================================
// NÚCLEO DE CONTEÚDO
// ============================================================================

model Curso {
  id                String   @id @default(cuid())
  
  // Informações Básicas
  titulo            String
  slug              String   @unique
  descricao         String?  @db.Text
  descricaoLonga    String?  @db.LongText @map("descricao_longa")
  
  // Instrutor
  instrutorId       String   @map("instrutor_id")
  
  // Categorização
  categoria         String?
  
  // Preço
  preco             Decimal? @db.Decimal(10, 2)
  
  // Mídia
  imagemCapa        String?  @map("imagem_capa")
  
  // Status
  status            StatusCurso @default(RASCUNHO)
  
  // Metadados
  nivel             NivelCurso @default(INTERMEDIARIO)
  
  // Timestamps
  dataPublicacao    DateTime? @map("data_publicacao")
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  instrutor         Usuario  @relation("InstructorCourses", fields: [instrutorId], references: [id])
  modulos           Modulo[]
  usuarioCursos     UsuarioCurso[]
  downloads         MidiaDownload[]

  @@index([slug])
  @@index([instrutorId])
  @@index([categoria])
  @@index([status])
  @@index([ativo])
  @@map("cursos")
}

enum StatusCurso {
  RASCUNHO           @map("rascunho")
  PUBLICADO          @map("publicado")
  ARQUIVADO          @map("arquivado")
}

enum NivelCurso {
  INICIANTE          @map("iniciante")
  INTERMEDIARIO      @map("intermediario")
  AVANCADO           @map("avancado")
}

model Modulo {
  id                String   @id @default(cuid())
  
  cursoId           String   @map("curso_id")
  
  // Informações
  titulo            String
  numeroOrdem       Int      @map("numero_ordem")
  descricao         String?  @db.Text
  
  // Status
  ativo             Boolean  @default(true)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  curso             Curso    @relation(fields: [cursoId], references: [id], onDelete: Cascade)
  aulas             Aula[]

  @@unique([cursoId, numeroOrdem])
  @@index([cursoId])
  @@index([numeroOrdem])
  @@index([ativo])
  @@map("modulos")
}

model Aula {
  id                String   @id @default(cuid())
  
  moduloId          String   @map("modulo_id")
  
  // Informações
  titulo            String
  numeroOrdem       Int      @map("numero_ordem")
  descricao         String?  @db.Text
  
  // Vídeo
  videoUrl          String?  @map("video_url")
  videoTipo         TipoVideo? @map("video_tipo")
  duracaoMinutos    Int?     @map("duracao_minutos")
  
  // Recursos
  recursosJson      String?  @db.Json @map("recursos")
  
  // Status
  ativo             Boolean  @default(true)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  modulo            Modulo   @relation(fields: [moduloId], references: [id], onDelete: Cascade)
  usuarioAulas      UsuarioAula[]

  @@unique([moduloId, numeroOrdem])
  @@index([moduloId])
  @@index([numeroOrdem])
  @@index([ativo])
  @@map("aulas")
}

enum TipoVideo {
  YOUTUBE            @map("youtube")
  VIMEO              @map("vimeo")
  BUNNY              @map("bunny")
  UPLOAD_DIRETO      @map("upload_direto")
}

model UsuarioCurso {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  cursoId           String   @map("curso_id")
  
  // Progresso
  progressoPercentual Decimal @default(0) @db.Decimal(5, 2) @map("progresso_percentual")
  aulasAssistidas   Int      @default(0) @map("aulas_assistidas")
  
  // Status
  status            StatusUsuarioCurso @default(INSCRITO)
  
  // Rastreamento
  dataInscricao     DateTime @default(now()) @map("data_inscricao")
  dataConclusao     DateTime? @map("data_conclusao")
  ultimaAulaAssistida String? @map("ultima_aula_assistida")
  dataUltimaAula    DateTime? @map("data_ultima_aula")
  
  // Certificado
  certificadoGerado Boolean  @default(false) @map("certificado_gerado")
  
  // Tempo
  tempoTotalMinutos Int      @default(0) @map("tempo_total_minutos")
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  curso             Curso    @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  @@unique([usuarioId, cursoId])
  @@index([usuarioId])
  @@index([cursoId])
  @@index([status])
  @@index([progressoPercentual])
  @@map("usuario_cursos")
}

enum StatusUsuarioCurso {
  INSCRITO           @map("inscrito")
  EM_ANDAMENTO       @map("em_andamento")
  CONCLUIDO          @map("concluido")
  ABANDONADO         @map("abandonado")
}

model UsuarioAula {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  aulaId            String   @map("aula_id")
  
  // Rastreamento
  dataVisualizacao  DateTime @default(now()) @map("data_visualizacao")
  duracaoAssistidaMin Int    @default(0) @map("duracao_assistida_minutos")
  progressoPercentual Decimal @default(0) @db.Decimal(5, 2) @map("progresso_percentual")
  
  // Status
  concluida         Boolean  @default(false)
  
  // Timestamps
  dataConclusao     DateTime? @map("data_conclusao")
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  aula              Aula     @relation(fields: [aulaId], references: [id], onDelete: Cascade)

  @@unique([usuarioId, aulaId])
  @@index([usuarioId])
  @@index([aulaId])
  @@index([dataVisualizacao])
  @@map("usuario_aulas")
}

// ============================================================================
// NÚCLEO DE CMS
// ============================================================================

model CMSPagina {
  id                String   @id @default(cuid())
  
  // Identificação
  titulo            String
  slug              String   @unique
  
  // Tipo
  tipoPagina        TipoPaginaCMS @default(CUSTOMIZADA) @map("tipo_pagina")
  
  // SEO
  metaTitle         String?  @map("meta_title")
  metaDescription   String?  @map("meta_description")
  metaKeywords      String?  @map("meta_keywords")
  ogImageUrl        String?  @map("og_image_url")
  
  // URL
  slugUrl           String?  @map("slug_url")
  
  // Status
  ativo             Boolean  @default(true)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  blocos            CMSBloco[]

  @@index([slug])
  @@index([tipoPagina])
  @@index([ativo])
  @@map("cms_paginas")
}

enum TipoPaginaCMS {
  HOME               @map("home")
  SOBRE              @map("sobre")
  BENEFICIOS         @map("beneficios")
  RODAPE             @map("rodape")
  BANNER             @map("banner")
  CUSTOMIZADA        @map("customizada")
}

model CMSBloco {
  id                String   @id @default(cuid())
  
  paginaId          String   @map("pagina_id")
  
  // Tipo
  tipoBloco         String   @map("tipo_bloco")
  
  // Posição
  posicaoOrdem      Int      @map("posicao_ordem")
  
  // Status
  ativo             Boolean  @default(true)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  pagina            CMSPagina @relation(fields: [paginaId], references: [id], onDelete: Cascade)
  conteudos         CMSConteudo[]

  @@unique([paginaId, posicaoOrdem])
  @@index([paginaId])
  @@index([tipoBloco])
  @@map("cms_blocos")
}

model CMSConteudo {
  id                String   @id @default(cuid())
  
  blocoId           String   @map("bloco_id")
  
  // Campo
  chave             String
  
  // Valores
  valorTexto        String?  @db.LongText @map("valor_texto")
  valorJson         String?  @db.Json @map("valor_json")
  
  // Tipo
  tipoCampo         TipoCampoCMS @default(TEXTO) @map("tipo_campo")
  
  // Ordem
  ordenacao         Int      @default(0)
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  bloco             CMSBloco @relation(fields: [blocoId], references: [id], onDelete: Cascade)

  @@unique([blocoId, chave])
  @@index([blocoId])
  @@index([chave])
  @@map("cms_conteudo")
}

enum TipoCampoCMS {
  TEXTO              @map("texto")
  TEXTAREA           @map("textarea")
  HTML               @map("html")
  NUMERO             @map("numero")
  BOOLEAN            @map("boolean")
  JSON               @map("json")
  IMAGEM             @map("imagem")
  VIDEO              @map("video")
}

model CMSConfiguracao {
  id                String   @id @default(cuid())
  
  // Identificação
  chave             String   @unique
  
  // Valores
  valorTexto        String?
  valorJson         String?  @db.Json
  
  // Tipo
  tipoValor         TipoValorCMS @default(TEXTO) @map("tipo_valor")
  
  // Descrição
  descricao         String?
  
  // Publicação
  requerPublicacao  Boolean  @default(false) @map("requer_publicacao")
  
  // Timestamps
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")

  @@index([chave])
  @@map("cms_configuracoes")
}

enum TipoValorCMS {
  TEXTO              @map("texto")
  URL                @map("url")
  NUMERO             @map("numero")
  JSON               @map("json")
  BOOLEAN            @map("boolean")
}

// ============================================================================
// NÚCLEO DE MÍDIA
// ============================================================================

model MidiaImagem {
  id                String   @id @default(cuid())
  
  // Arquivo
  nomeArquivo       String   @map("nome_arquivo")
  urlPublica        String   @map("url_publica")
  
  // Informações do arquivo
  tamanhoBytes      Int      @map("tamanho_bytes")
  
  // Dimensões
  largura           Int?
  altura            Int?
  
  // Tipo MIME
  mimeType          String   @map("mime_type")
  
  // Proprietário
  usuarioId         String?  @map("usuario_id")
  
  // Uso
  usoEm             String?  @map("uso_em")
  
  // Timestamps
  dataUpload        DateTime @default(now()) @map("data_upload")
  
  usuario           Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  @@index([usuarioId])
  @@index([dataUpload])
  @@index([usoEm])
  @@map("midia_imagens")
}

model MidiaVideo {
  id                String   @id @default(cuid())
  
  // Informações
  titulo            String
  
  // Link externo
  urlExterna        String   @map("url_externa")
  tipoPlataforma    TipoPlataformaVideo @default(YOUTUBE) @map("tipo_plataforma")
  videoIdExterno    String?  @map("video_id_externo")
  
  // Metadados
  duracaoSegundos   Int?     @map("duracao_segundos")
  thumbnailUrl      String?  @map("thumbnail_url")
  
  // Proprietário
  usuarioId         String?  @map("usuario_id")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuario           Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  @@index([usuarioId])
  @@index([dataCriacao])
  @@index([tipoPlataforma])
  @@map("midia_videos")
}

enum TipoPlataformaVideo {
  YOUTUBE            @map("youtube")
  VIMEO              @map("vimeo")
  BUNNY              @map("bunny")
  OUTRO              @map("outro")
}

model MidiaDownload {
  id                String   @id @default(cuid())
  
  // Arquivo
  nomeArquivo       String   @map("nome_arquivo")
  urlDownload       String   @map("url_download")
  tamanhoBytes      Int      @map("tamanho_bytes")
  tipoArquivo       String?  @map("tipo_arquivo")
  
  // Relacionamento
  cursoId           String?  @map("curso_id")
  usuarioIdCriador  String?  @map("usuario_id_criador")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  curso             Curso?   @relation(fields: [cursoId], references: [id], onDelete: Cascade)
  usuarioCriador    Usuario? @relation("CreatorDownloads", fields: [usuarioIdCriador], references: [id], onDelete: SetNull)

  @@index([cursoId])
  @@index([usuarioIdCriador])
  @@index([dataCriacao])
  @@index([ativo])
  @@map("midia_downloads")
}

// ============================================================================
// NÚCLEO DE COMUNIDADE
// ============================================================================

model PostComunidade {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  
  // Conteúdo
  conteudo          String   @db.Text
  imagemUrl         String?  @map("imagem_url")
  videoUrl          String?  @map("video_url")
  
  // Engajamento
  curtidosCount     Int      @default(0) @map("curtidas_count")
  comentariosCount  Int      @default(0) @map("comentarios_count")
  compartilhasCount Int      @default(0) @map("compartilhas_count")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  comentarios       ComentarioComunidade[]
  reacoes           ReacaoComunidade[]

  @@index([usuarioId])
  @@index([dataCriacao])
  @@index([ativo])
  @@map("comunidade_posts")
}

model ComentarioComunidade {
  id                String   @id @default(cuid())
  
  postId            String   @map("post_id")
  usuarioId         String   @map("usuario_id")
  comentarioPaiId   String?  @map("comentario_pai_id")
  
  // Conteúdo
  conteudo          String   @db.Text
  
  // Engajamento
  curtidosCount     Int      @default(0) @map("curtidas_count")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  post              PostComunidade @relation(fields: [postId], references: [id], onDelete: Cascade)
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  comentarioPai     ComentarioComunidade? @relation("RepliesComentario", fields: [comentarioPaiId], references: [id], onDelete: Cascade)
  replies           ComentarioComunidade[] @relation("RepliesComentario")
  reacoes           ReacaoComunidade[]

  @@index([postId])
  @@index([usuarioId])
  @@index([dataCriacao])
  @@index([ativo])
  @@map("comunidade_comentarios")
}

model ReacaoComunidade {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  postId            String?  @map("post_id")
  comentarioId      String?  @map("comentario_id")
  
  // Tipo de reação
  tipoReacao        TipoReacao @default(CURTIDA) @map("tipo_reacao")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  post              PostComunidade? @relation(fields: [postId], references: [id], onDelete: Cascade)
  comentario        ComentarioComunidade? @relation(fields: [comentarioId], references: [id], onDelete: Cascade)

  @@unique([usuarioId, postId, comentarioId])
  @@index([usuarioId])
  @@index([postId])
  @@index([comentarioId])
  @@map("comunidade_reacoes")
}

enum TipoReacao {
  CURTIDA            @map("curtida")
  AMEI               @map("amei")
  ADOREI             @map("adorei")
  HAHA               @map("haha")
  UAU                @map("uau")
  TRISTE             @map("triste")
  RAIVA              @map("raiva")
}

// ============================================================================
// NÚCLEO DE OPERAÇÕES
// ============================================================================

model OperacaoAoVivo {
  id                String   @id @default(cuid())
  
  // Informações
  titulo            String
  descricao         String?  @db.Text
  
  // Datas
  dataInicio        DateTime @map("data_inicio")
  dataFim           DateTime? @map("data_fim")
  
  // Status
  status            StatusOperacao @default(AGENDADA)
  
  // Transmissão
  urlTransmissao    String?  @map("url_transmissao")
  
  // Criador
  usuarioCriadorId  String   @map("usuario_criador_id")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuarioCriador    Usuario  @relation("CreatorOperations", fields: [usuarioCriadorId], references: [id], onDelete: Cascade)
  trades            OperacaoTrade[]
  replays           OperacaoReplay[]

  @@index([usuarioCriadorId])
  @@index([status])
  @@index([dataInicio])
  @@index([ativo])
  @@map("operacoes_ao_vivo")
}

enum StatusOperacao {
  AGENDADA           @map("agendada")
  AO_VIVO            @map("ao_vivo")
  FINALIZADA         @map("finalizada")
  CANCELADA          @map("cancelada")
}

model OperacaoTrade {
  id                String   @id @default(cuid())
  
  operacaoId        String   @map("operacao_id")
  
  // Ativo
  ativoTicker       String   @map("ativo_ticker")
  
  // Operação
  tipoOperacao      TipoOperacao @map("tipo_operacao")
  
  // Preços
  precoEntrada      Decimal  @db.Decimal(10, 4) @map("preco_entrada")
  precoSaida        Decimal? @db.Decimal(10, 4) @map("preco_saida")
  
  // Resultado
  resultado         ResultadoOperacao @default(PENDENTE)
  
  // Execução
  dataExecucao      DateTime? @map("data_execucao")
  
  // Status
  ativo             Boolean  @default(true)
  
  operacao          OperacaoAoVivo @relation(fields: [operacaoId], references: [id], onDelete: Cascade)

  @@index([operacaoId])
  @@index([ativoTicker])
  @@index([resultado])
  @@index([dataExecucao])
  @@map("operacoes_trades")
}

enum TipoOperacao {
  COMPRA             @map("compra")
  VENDA              @map("venda")
  CALL               @map("call")
  PUT                @map("put")
}

enum ResultadoOperacao {
  WIN                @map("win")
  LOSS               @map("loss")
  PARCIAL            @map("parcial")
  PENDENTE           @map("pendente")
}

model OperacaoReplay {
  id                String   @id @default(cuid())
  
  operacaoId        String   @unique @map("operacao_id")
  
  // Vídeo
  urlVideoGravacao  String   @map("url_video_gravacao")
  
  // Disponibilidade
  dataDisponvelDesde DateTime @map("data_disponivel_desde")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  operacao          OperacaoAoVivo @relation(fields: [operacaoId], references: [id], onDelete: Cascade)

  @@index([operacaoId])
  @@index([dataDisponvelDesde])
  @@map("operacoes_replays")
}

// ============================================================================
// NÚCLEO DE PAGAMENTOS & AUDITORIA
// ============================================================================

model Pagamento {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  assinaturaId      String?  @map("assinatura_id")
  
  // Valor
  valor             Decimal  @db.Decimal(10, 2)
  moeda             String   @default("BRL")
  
  // Gateway
  gatewayPagamento  String?  @map("gateway_pagamento")
  idTransacaoExterno String? @unique @map("id_transacao_externo")
  
  // Status
  statusPagamento   StatusPagamento @default(PENDENTE) @map("status_pagamento")
  
  // Método
  metodoPagamento   String?  @map("metodo_pagamento")
  
  // Datas
  dataPagamento     DateTime? @map("data_pagamento")
  dataProximaTentativa DateTime? @map("data_proxima_tentativa")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  assinatura        Assinatura? @relation(fields: [assinaturaId], references: [id], onDelete: SetNull)
  faturas           Fatura[]

  @@index([usuarioId])
  @@index([assinaturaId])
  @@index([statusPagamento])
  @@index([dataPagamento])
  @@index([dataCriacao])
  @@map("pagamentos")
}

enum StatusPagamento {
  PENDENTE           @map("pendente")
  PROCESSANDO        @map("processando")
  APROVADO           @map("aprovado")
  RECUSADO           @map("recusado")
  EXPIRADO           @map("expirado")
  CANCELADO          @map("cancelado")
}

model Fatura {
  id                String   @id @default(cuid())
  
  pagamentoId       String   @map("pagamento_id")
  
  // Fatura
  numeroFatura      String   @unique @map("numero_fatura")
  valor             Decimal  @db.Decimal(10, 2)
  
  // Datas
  dataEmissao       DateTime @db.Date @map("data_emissao")
  dataVencimento    DateTime? @db.Date @map("data_vencimento")
  
  // Status
  status            StatusFatura @default(EMITIDA)
  
  // URL
  urlDownload       String?  @map("url_download")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  pagamento         Pagamento @relation(fields: [pagamentoId], references: [id], onDelete: Cascade)

  @@index([pagamentoId])
  @@index([status])
  @@index([dataEmissao])
  @@map("faturas")
}

enum StatusFatura {
  EMITIDA            @map("emitida")
  PAGA               @map("paga")
  VENCIDA            @map("vencida")
  CANCELADA          @map("cancelada")
}

model LogAuditoria {
  id                String   @id @default(cuid())
  
  usuarioId         String?  @map("usuario_id")
  
  // Ação
  tipoAcao          String   @map("tipo_acao")
  
  // Alvo
  tabelaAfetada     String   @map("tabela_afetada")
  registroId        String?  @map("registro_id")
  
  // Valores
  valoresAntigos    String?  @db.Json @map("valores_antigos")
  valoresNovos      String?  @db.Json @map("valores_novos")
  
  // IP e User Agent
  ipAddress         String?  @map("ip_address")
  userAgent         String?  @map("user_agent")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  usuario           Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  @@index([usuarioId])
  @@index([tipoAcao])
  @@index([tabelaAfetada])
  @@index([dataCriacao])
  @@map("log_auditoria")
}

model WebhookLog {
  id                String   @id @default(cuid())
  
  // Origem
  origemWebhook     String   @map("origem_webhook")
  
  // Dados
  dadosRecebidos    String   @db.Json @map("dados_recebidos")
  
  // Resposta
  statusResposta    Int?     @map("status_resposta")
  
  // Timestamps
  dataRecebimento   DateTime @default(now()) @map("data_recebimento")
  
  // Retry
  tentativas        Int      @default(1)
  proximaTentativa   DateTime? @map("proxima_tentativa")
  
  // Status
  ativo             Boolean  @default(true)

  @@index([origemWebhook])
  @@index([dataRecebimento])
  @@index([ativo])
  @@map("webhooks_log")
}

// ============================================================================
// NÚCLEO DE SUPORTE
// ============================================================================

model TicketSuporte {
  id                String   @id @default(cuid())
  
  usuarioId         String   @map("usuario_id")
  
  // Ticket
  titulo            String
  descricao         String   @db.Text
  
  // Status e Prioridade
  status            StatusTicketSuporte @default(ABERTO)
  prioridade        PrioridadeTicket @default(MEDIA)
  
  // Categoria
  categoria         String?
  
  // Atendimento
  atendenteId       String?  @map("atendente_id")
  
  // Datas
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  dataAtualizacao   DateTime @updatedAt @map("data_atualizacao")
  dataResolucao     DateTime? @map("data_resolucao")
  
  // Status
  ativo             Boolean  @default(true)
  
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  atendente         Usuario? @relation("AttendantTickets", fields: [atendenteId], references: [id], onDelete: SetNull)
  mensagens         MensagemSuporte[]

  @@index([usuarioId])
  @@index([atendenteId])
  @@index([status])
  @@index([prioridade])
  @@index([dataCriacao])
  @@map("suporte_tickets")
}

enum StatusTicketSuporte {
  ABERTO             @map("aberto")
  EM_ANDAMENTO       @map("em_andamento")
  AGUARDANDO_CLIENTE @map("aguardando_cliente")
  RESOLVIDO          @map("resolvido")
  FECHADO            @map("fechado")
}

enum PrioridadeTicket {
  BAIXA              @map("baixa")
  MEDIA              @map("media")
  ALTA               @map("alta")
  CRITICA            @map("critica")
}

model MensagemSuporte {
  id                String   @id @default(cuid())
  
  ticketId          String   @map("ticket_id")
  usuarioId         String   @map("usuario_id")
  
  // Conteúdo
  mensagem          String   @db.Text
  arquivoAnexo      String?  @map("arquivo_anexo")
  
  // Timestamps
  dataCriacao       DateTime @default(now()) @map("data_criacao")
  
  // Status
  ativo             Boolean  @default(true)
  
  ticket            TicketSuporte @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  usuario           Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([usuarioId])
  @@index([dataCriacao])
  @@map("suporte_mensagens")
}
```

---

## 4. RELACIONAMENTOS DETALHADOS

### 4.1 Relacionamentos One-to-One (1:1)

```
Usuario ──1:1── Assinatura
│
├─ Um usuário tem apenas UMA assinatura ativa por vez
├─ Assinatura pertence a exatamente UM usuário
├─ Cascade delete: Se usuário é deletado, assinatura também é
└─ UNIQUE constraint em usuario_id em Assinatura
```

### 4.2 Relacionamentos One-to-Many (1:N)

```
Curso ──1:N── Modulo
│
├─ Um curso tem MÚLTIPLOS módulos
├─ Cada módulo pertence a EXATAMENTE UM curso
├─ Cascade delete: Se curso é deletado, todos os módulos também são
└─ INDEX em curso_id em modulos

Modulo ──1:N── Aula
│
├─ Um módulo tem MÚLTIPLAS aulas
├─ Cada aula pertence a EXATAMENTE UM módulo
├─ Cascade delete: Se módulo é deletado, todas as aulas também são
└─ INDEX em modulo_id em aulas

CMSPagina ──1:N── CMSBloco
│
├─ Uma página tem MÚLTIPLOS blocos
├─ Cada bloco pertence a EXATAMENTE UMA página
├─ Cascade delete: Se página é deletada, todos os blocos também são
└─ INDEX em pagina_id em cms_blocos

CMSBloco ──1:N── CMSConteudo
│
├─ Um bloco tem MÚLTIPLOS conteúdos
├─ Cada conteúdo pertence a EXATAMENTE UM bloco
├─ Cascade delete: Se bloco é deletado, todos os conteúdos também são
└─ INDEX em bloco_id em cms_conteudo

OperacaoAoVivo ──1:N── OperacaoTrade
│
├─ Uma operação tem MÚLTIPLOS trades
├─ Cada trade pertence a EXATAMENTE UMA operação
├─ Cascade delete: Se operação é deletada, todos os trades também são
└─ INDEX em operacao_id em operacoes_trades

OperacaoAoVivo ──1:N── OperacaoReplay
│
├─ Uma operação tem UM replay (UNIQUE constraint)
├─ Cada replay pertence a EXATAMENTE UMA operação
├─ Cascade delete: Se operação é deletada, replay também é deletado
└─ INDEX em operacao_id em operacoes_replays

Pagamento ──1:N── Fatura
│
├─ Um pagamento pode ter MÚLTIPLAS faturas (para parcelamento)
├─ Cada fatura pertence a EXATAMENTE UM pagamento
├─ Cascade delete: Se pagamento é deletado, todas as faturas também são
└─ INDEX em pagamento_id em faturas

TicketSuporte ──1:N── MensagemSuporte
│
├─ Um ticket tem MÚLTIPLAS mensagens
├─ Cada mensagem pertence a EXATAMENTE UM ticket
├─ Cascade delete: Se ticket é deletado, todas as mensagens também são
└─ INDEX em ticket_id em suporte_mensagens

PostComunidade ──1:N── ComentarioComunidade
│
├─ Um post tem MÚLTIPLOS comentários
├─ Cada comentário pertence a EXATAMENTE UM post
├─ Cascade delete: Se post é deletado, todos os comentários também são
└─ INDEX em post_id em comunidade_comentarios
```

### 4.3 Relacionamentos Many-to-Many (N:N)

```
Usuario ──N:M── Curso (através de UsuarioCurso)
│
├─ Um usuário pode estar inscrito em MÚLTIPLOS cursos
├─ Um curso pode ter MÚLTIPLOS usuários inscritos
├─ UNIQUE constraint em (usuario_id, curso_id)
├─ Armazena: data_inscricao, progresso, status, etc
└─ INDEX em usuario_id e curso_id

Usuario ──N:M── Aula (através de UsuarioAula)
│
├─ Um usuário visualiza MÚLTIPLAS aulas
├─ Uma aula é visualizada por MÚLTIPLOS usuários
├─ UNIQUE constraint em (usuario_id, aula_id)
├─ Armazena: data_visualizacao, progresso, duração
└─ INDEX em usuario_id e aula_id

Usuario ──N:M── Post (através de ReacaoComunidade)
│
├─ Um usuário reage a MÚLTIPLOS posts
├─ Um post recebe reações de MÚLTIPLOS usuários
├─ UNIQUE constraint em (usuario_id, post_id)
├─ Armazena: tipo_reacao, data_criacao
└─ INDEX em usuario_id e post_id

Usuario ──N:M── Comentario (através de ReacaoComunidade)
│
├─ Um usuário reage a MÚLTIPLOS comentários
├─ Um comentário recebe reações de MÚLTIPLOS usuários
├─ UNIQUE constraint em (usuario_id, comentario_id)
├─ Armazena: tipo_reacao, data_criacao
└─ INDEX em usuario_id e comentario_id

Usuario ──N:M── Permissoes (através de Permissao)
│
├─ Um usuário tem MÚLTIPLAS permissões
├─ Uma permissão pertence a UM usuário
├─ UNIQUE constraint em (usuario_id, tipo_permissao, tabela_alvo, recurso_alvo)
├─ Armazena: data_expiracao, ativo
└─ INDEX em usuario_id e tipo_permissao
```

### 4.4 Relacionamentos Hierárquicos

```
ComentarioComunidade ──Self-Join── ComentarioComunidade
│
├─ Um comentário pode ter UMA resposta pai (comentario_pai_id)
├─ Um comentário pode ter MÚLTIPLAS respostas (replies)
├─ Permite comentários aninhados (replies de replies)
├─ Cascade delete: Se comentário pai é deletado, replies também são
└─ INDEX em comentario_pai_id
```

---

## 5. ESTRATÉGIA DE CMS DINÂMICO

### 5.1 Estrutura CMS Edição de Elementos

O painel admin permite edição de **12 elementos principais** DIRETAMENTE pelo banco sem código:

```
ELEMENTOS EDITÁVEIS VIA PAINEL CMS
═════════════════════════════════════════════════════════════════

1️⃣  HOME HERO
   ├─ Tipo: CMSPagina (tipo_pagina='home') + CMSBloco (tipo_bloco='hero')
   ├─ Campos Editáveis:
   │  ├─ titulo_principal (CMSConteudo: chave='titulo_principal')
   │  ├─ subtitulo (CMSConteudo: chave='subtitulo')
   │  ├─ descricao (CMSConteudo: chave='descricao', tipo_campo='html')
   │  ├─ imagem_fundo (CMSConteudo: chave='imagem_fundo', tipo_campo='imagem')
   │  ├─ botao_cta_texto (CMSConteudo: chave='botao_cta_texto')
   │  └─ botao_cta_url (CMSConteudo: chave='botao_cta_url')
   │
   ├─ Fluxo de Edição:
   │  1. Admin acessa /admin/cms/pages/home
   │  2. Clica em "Editar Bloco Hero"
   │  3. Modifica campos via formulário
   │  4. Clica "Salvar" → atualiza CMSConteudo
   │  5. Frontend carrega dados via API /api/cms/pages/home
   │
   └─ Renderização Frontend:
      → GET /api/cms/pages/home retorna JSON com todos os campos
      → Component <HomeHero> mapeia dados do JSON
      → Imagens servidas de Vercel Blob Storage

2️⃣  BENEFÍCIOS
   ├─ Tipo: CMSPagina (tipo_pagina='beneficios') + N CMSBlocos
   ├─ Campos Editáveis:
   │  ├─ titulo_secao
   │  ├─ descricao_secao
   │  └─ beneficios_json (array de objetos com título, descrição, ícone)
   │
   ├─ Estrutura JSON:
   │  {
   │    "beneficios": [
   │      { "titulo": "Grupo VIP", "descricao": "...", "icone_url": "..." },
   │      { "titulo": "Operações ao Vivo", "descricao": "...", "icone_url": "..." },
   │      ...
   │    ]
   │  }
   │
   └─ Edição: Admin adiciona/remove/ordena benefícios via painel

3️⃣  SOBRE (ABOUT)
   ├─ Tipo: CMSPagina (tipo_pagina='sobre')
   ├─ Campos Editáveis:
   │  ├─ titulo_sobre
   │  ├─ missao_texto (html)
   │  ├─ visao_texto (html)
   │  ├─ valores_json (array)
   │  ├─ historia_texto (html)
   │  ├─ time_json (array com membros)
   │  └─ premios_json (array)
   │
   └─ Fluxo: Similar ao Hero, mas com mais campos de rich text

4️⃣  DEPOIMENTOS
   ├─ Tipo: Tabela separada COMUNIDADE_POSTS com marcação especial
   ├─ Campos Editáveis:
   │  ├─ autor_nome
   │  ├─ autor_descricao (ex: "Trader, ganhou R$ 50k")
   │  ├─ foto_autor (MidiaImagem com uso_em='testimonial')
   │  ├─ conteudo_depoimento (texto/html)
   │  ├─ rating (1-5)
   │  ├─ video_depoimento_url (opcional)
   │  └─ data_publicacao
   │
   ├─ Fluxo:
   │  1. Admin vai para /admin/cms/testimonials
   │  2. Cria novo depoimento via formulário
   │  3. Upload de foto → MidiaImagem (uso_em='testimonial')
   │  4. Clica "Publicar" → ativa visibilidade
   │
   └─ Renderização: Frontend carrega via /api/cms/testimonials?limit=6

5️⃣  FAQ
   ├─ Tipo: CMSPagina + CMSBlocos (tipo_bloco='faq')
   ├─ Campos Editáveis:
   │  ├─ faq_json (array de pergunta/resposta)
   │
   ├─ Estrutura JSON:
   │  {
   │    "items": [
   │      { "pergunta": "Como funciona?", "resposta": "...", "ordem": 1 },
   │      { "pergunta": "Quanto custa?", "resposta": "...", "ordem": 2 },
   │      ...
   │    ]
   │  }
   │
   └─ Edição: Drag-and-drop para reordenar, add/remove/edit inline

6️⃣  RODAPÉ (FOOTER)
   ├─ Tipo: CMSPagina (tipo_pagina='rodape') + CMSBlocos
   ├─ Campos Editáveis:
   │  ├─ copyright_texto
   │  ├─ links_rapidos_json (array de {label, url})
   │  ├─ sobre_rodape_texto
   │  ├─ contato_rodape (email, telefone)
   │  ├─ redes_sociais_json (array de {rede, url})
   │  ├─ newsletter_habilitada (boolean)
   │  └─ newsletter_label
   │
   └─ Edição: Admin edita cada seção separadamente no painel

7️⃣  WHATSAPP
   ├─ Tipo: CMSConfiguracao (chave='whatsapp_numero')
   ├─ Campos Editáveis:
   │  ├─ numero_whatsapp (ex: "5511999999999")
   │  ├─ mensagem_padrao
   │  ├─ horario_inicio_atendimento
   │  ├─ horario_fim_atendimento
   │  └─ habilitado (boolean)
   │
   └─ Uso Frontend: Botão flutuante com link wa.me/{numero}

8️⃣  REDES SOCIAIS
   ├─ Tipo: CMSConfiguracao (chave='redes_sociais_links')
   ├─ Campos Editáveis:
   │  ├─ valor_json: {
   │  │    "facebook": "...",
   │  │    "instagram": "...",
   │  │    "youtube": "...",
   │  │    "linkedin": "...",
   │  │    "tiktok": "...",
   │  │    "twitter": "..."
   │  │  }
   │
   └─ Edição: Array de URLs editável no painel

9️⃣  LOGO
   ├─ Tipo: MidiaImagem (uso_em='logo')
   ├─ Campos Editáveis:
   │  ├─ URL da logo
   │  ├─ Logo dark (para light mode)
   │  └─ Logo light (para dark mode)
   │
   ├─ Upload:
   │  1. Admin vai para /admin/cms/images
   │  2. Upload arquivo
   │  3. Sistema salva em MidiaImagem com uso_em='logo'
   │  4. Frontend carrega via GET /api/cms/images?uso_em=logo
   │
   └─ Armazenamento: Vercel Blob Storage (via vercel-blob)

🔟  FAVICON
   ├─ Tipo: MidiaImagem (uso_em='favicon')
   ├─ Upload similar ao logo
   ├─ Formatos: .ico, .png, .jpg
   └─ Frontend: Dinamicamente injetado no <head>

1️⃣1️⃣  SEO (Meta Tags)
   ├─ Tipo: CMSPagina (meta_title, meta_description, meta_keywords, og_image_url)
   ├─ Campos Editáveis por Página:
   │  ├─ meta_title (55-60 caracteres)
   │  ├─ meta_description (150-160 caracteres)
   │  ├─ meta_keywords (comma-separated)
   │  ├─ og_image_url
   │  ├─ og_title
   │  └─ og_description
   │
   ├─ Editor Visual:
   │  - Campo com contador de caracteres
   │  - Preview de como fica no Google
   │  - Validação automática
   │
   └─ Renderização: Meta tags geradas dinamicamente em layout.tsx

1️⃣2️⃣  BANNERS
   ├─ Tipo: CMSPagina (tipo_pagina='banner') + CMSBlocos
   ├─ Campos Editáveis:
   │  ├─ titulo_banner
   │  ├─ descricao_banner
   │  ├─ imagem_banner (MidiaImagem com uso_em='banner')
   │  ├─ cor_fundo
   │  ├─ texto_botao
   │  ├─ url_botao
   │  ├─ data_inicio_exibicao
   │  ├─ data_fim_exibicao
   │  ├─ paginas_onde_exibir (json array)
   │  └─ ativo (boolean)
   │
   ├─ Fluxo:
   │  1. Admin cria novo banner
   │  2. Configura datas de início/fim
   │  3. Seleciona páginas onde exibir
   │  4. Clica "Publicar"
   │
   └─ Frontend: Carrega banners ativos via /api/cms/banners?page=home
```

### 5.2 Fluxo de Dados CMS

```
FLUXO EDIÇÃO → SALVAMENTO → RENDERIZAÇÃO
═════════════════════════════════════════════════════════════════

┌─ PAINEL ADMIN ─────────────────────────────────────┐
│                                                     │
│  Form Editável                                      │
│  ├─ Campo 1: [ Título principal      ]            │
│  ├─ Campo 2: [ Descrição             ]            │
│  ├─ Campo 3: [ Selecionar Imagem     ]            │
│  └─ [Salvar] [Cancelar] [Publicar]                │
│                                                     │
└─ POST /api/admin/cms/blocos/[blocoId] ────────────┘
   │
   │ Payload:
   │ {
   │   "blocoId": "uuid",
   │   "conteudos": [
   │     { "chave": "titulo_principal", "valorTexto": "Novo Título" },
   │     { "chave": "descricao", "valorTexto": "Nova desc", "tipoCampo": "html" },
   │     { "chave": "imagem", "valorTexto": "https://blob.vercel..."}
   │   ]
   │ }
   │
   ▼
┌─ BACKEND (Next.js API Route) ──────────────────────┐
│                                                     │
│  POST /api/admin/cms/blocos/[blocoId]              │
│  ├─ Validação de permissões (admin only)           │
│  ├─ Validação de dados                             │
│  ├─ Update CMSConteudo table                       │
│  │  UPDATE cms_conteudo SET                       │
│  │    valor_texto = ?,                             │
│  │    data_atualizacao = NOW()                     │
│  │  WHERE bloco_id = ? AND chave = ?              │
│  ├─ Invalidar cache em Vercel (revalidateTag)      │
│  └─ Retornar 200 OK com dados atualizados         │
│                                                     │
└────────────────────────────────────────────────────┘
   │
   ▼
┌─ CACHE/REVALIDAÇÃO ────────────────────────────────┐
│                                                     │
│  1. Chamar revalidateTag('cms-pagina-home')        │
│  2. Cache Vercel é invalidado                      │
│  3. Próximo GET vai buscar dados frescos do DB     │
│                                                     │
└────────────────────────────────────────────────────┘
   │
   ▼
┌─ FRONTEND (GET Request) ───────────────────────────┐
│                                                     │
│  GET /api/cms/pages/home                          │
│  ├─ Busca em CMSPagina onde slug='home'           │
│  ├─ Busca todos os CMSBlocos relacionados         │
│  ├─ Busca todos os CMSConteudos dos blocos        │
│  └─ Retorna JSON estruturado                      │
│                                                     │
│  Response:                                          │
│  {                                                  │
│    "pagina": {                                      │
│      "id": "uuid",                                  │
│      "titulo": "Home",                              │
│      "slug": "home",                                │
│      "metaTitle": "...",                            │
│      "metaDescription": "...",                      │
│      "blocos": [                                    │
│        {                                            │
│          "id": "uuid",                              │
│          "tipo": "hero",                            │
│          "conteudos": {                             │
│            "titulo_principal": "Bem-vindo",        │
│            "descricao": "...",                      │
│            "imagem_fundo": "https://..."           │
│          }                                          │
│        }                                            │
│      ]                                              │
│    }                                                │
│  }                                                  │
│                                                     │
└────────────────────────────────────────────────────┘
   │
   ▼
┌─ COMPONENT (React) ────────────────────────────────┐
│                                                     │
│  <HomePage>                                         │
│    ├─ Fetch: const data = await fetch(/api/cms/...)
│    ├─ Render:                                       │
│    │  └─ <HomeHero                                 │
│    │      titulo={data.blocos[0].conteudos...}    │
│    │      descricao={...}                          │
│    │      imagem={...}                             │
│    │    />                                          │
│    └─ Meta tags geradas dinamicamente              │
│                                                     │
└────────────────────────────────────────────────────┘
```

### 5.3 Exemplo: Editar Hero da Home

**Passo 1: No Banco**
```sql
-- CMSPagina existe
SELECT * FROM cms_paginas WHERE slug = 'home';
-- id: uuid-home, titulo: Home, tipo_pagina: home

-- CMSBlocos existem
SELECT * FROM cms_blocos WHERE pagina_id = 'uuid-home' AND tipo_bloco = 'hero';
-- id: uuid-hero-bloco, posicao_ordem: 1

-- CMSConteudos existem
SELECT * FROM cms_conteudo WHERE bloco_id = 'uuid-hero-bloco';
-- Contém todos os campos (titulo_principal, subtitulo, etc)
```

**Passo 2: Admin Edita**
```
PAINEL: /admin/cms/pages/home → Clica em "Editar Hero"

Formulário abre com campos:
- Título Principal: "Bem-vindo à Comunidade RP"
- Descrição: "Aprenda trading de verdade..."
- Imagem: [Browse] → Seleciona imagem
- Botão CTA: "Comece Agora"
- Clica [Salvar]
```

**Passo 3: Backend Processa**
```typescript
// POST /api/admin/cms/blocos/uuid-hero-bloco
const { conteudos } = req.body;

for (const item of conteudos) {
  await prisma.cmsConteudo.update({
    where: {
      blocoId_chave: {
        blocoId: "uuid-hero-bloco",
        chave: item.chave  // "titulo_principal"
      }
    },
    data: {
      valorTexto: item.valorTexto,
      dataAtualizacao: new Date()
    }
  });
}

// Invalida cache
revalidateTag('cms-pagina-home');
```

**Passo 4: Frontend Carrega**
```typescript
// GET /api/cms/pages/home
const response = await fetch('/api/cms/pages/home', {
  next: { tags: ['cms-pagina-home'], revalidate: 3600 }
});

const data = await response.json();
// data.blocos[0].conteudos = {
//   titulo_principal: "Bem-vindo à Comunidade RP",
//   descricao: "Aprenda trading de verdade...",
//   imagem_fundo: "https://blob.vercel.sh/uuid"
// }

return (
  <HomeHero
    titulo={data.blocos[0].conteudos.titulo_principal}
    descricao={data.blocos[0].conteudos.descricao}
    imagem={data.blocos[0].conteudos.imagem_fundo}
  />
);
```

---

## 6. ESTRATÉGIA DE UPLOAD DE IMAGENS

### 6.1 Arquitetura de Upload

```
ARQUITETURA DE UPLOAD DE IMAGENS
═════════════════════════════════════════════════════════════════

Tecnologia: Vercel Blob Storage
├─ Sem servidor
├─ CDN global integrado
├─ Atendimento rápido por edge locations
├─ Autoscaling automático
└─ Integração nativa com Next.js

FLUXO COMPLETO
═════════════════════════════════════════════════════════════════

1️⃣  SELEÇÃO DE ARQUIVO (Cliente)
   ├─ Input type="file" com accept="image/*"
   ├─ Validação Client-side:
   │  ├─ Tamanho máx: 5MB
   │  ├─ Formatos: jpg, png, webp, gif
   │  ├─ Dimensões mín: 100x100px
   │  └─ Dimensões máx: 4000x4000px
   └─ Preview de imagem antes do upload

2️⃣  UPLOAD PARA BLOB (Cliente → Vercel Blob)
   │
   ├─ Arquivo selecionado
   ├─ Compressão cliente (opcional)
   ├─ Upload via PUT /api/upload
   │
   └─ Response:
      {
        "url": "https://blob.vercel.sh/uuid-arquivo.jpg",
        "size": 123456,
        "uploadedAt": "2026-01-15T10:30:00Z"
      }

3️⃣  REGISTRO NO BANCO (API Route)
   │
   ├─ POST /api/cms/upload
   │
   ├─ Body:
   │  {
   │    "url": "https://blob.vercel.sh/uuid-arquivo.jpg",
   │    "tamanho": 123456,
   │    "mimeType": "image/jpeg",
   │    "largura": 1200,
   │    "altura": 800,
   │    "usoEm": "logo",  // ou "banner", "testimonial", etc
   │    "blocoId": "uuid-hero-bloco"  // opcional
   │  }
   │
   ├─ Salva em MidiaImagem:
   │  INSERT INTO midia_imagens (
   │    id, nome_arquivo, url_publica, tamanho_bytes,
   │    largura, altura, mime_type, usuario_id, uso_em,
   │    data_upload
   │  ) VALUES (...)
   │
   └─ Retorna:
      {
        "id": "uuid-imagem",
        "url": "https://blob.vercel.sh/uuid-arquivo.jpg",
        "usoEm": "logo"
      }

4️⃣  ASSOCIAÇÃO AO CONTEÚDO (CMS)
   │
   ├─ Se imagem é para bloco CMS:
   │  UPDATE cms_conteudo SET
   │    valor_texto = 'https://blob.vercel.sh/uuid-arquivo.jpg'
   │  WHERE bloco_id = 'uuid-hero-bloco'
   │    AND chave = 'imagem_fundo'
   │
   └─ Se imagem é para depoimento:
      Salva em PostComunidade.imagem_url com referência

5️⃣  RENDERIZAÇÃO NO FRONTEND
   │
   ├─ <Image
   │    src="https://blob.vercel.sh/uuid-arquivo.jpg"
   │    alt="Logo"
   │    width={200}
   │    height={100}
   │    priority
   │  />
   │
   └─ Imagem entregue via Vercel CDN em <10ms
```

### 6.2 Implementação TypeScript

```typescript
// lib/blob-storage.ts
import { put, del } from '@vercel/blob';

interface UploadOptions {
  usuarioId?: string;
  usoEm?: 'logo' | 'banner' | 'testimonial' | 'cms';
  maxSize?: number;
}

export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; size: number }> {
  const { usuarioId, maxSize = 5 * 1024 * 1024 } = options;

  // Validações
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem');
  }

  if (file.size > maxSize) {
    throw new Error(`Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
  }

  // Upload para Blob
  const blob = await put(`cms/${Date.now()}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  // Registra no banco
  await prisma.midiaImagem.create({
    data: {
      nomeArquivo: file.name,
      urlPublica: blob.url,
      tamanhoBytes: file.size,
      mimeType: file.type,
      usuarioId,
      usoEm: options.usoEm,
    },
  });

  return {
    url: blob.url,
    size: file.size,
  };
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);

  // Remove do banco
  await prisma.midiaImagem.deleteMany({
    where: { urlPublica: url },
  });
}

export async function getImagesByUsage(
  usoEm: string
): Promise<MidiaImagem[]> {
  return prisma.midiaImagem.findMany({
    where: { usoEm },
    orderBy: { dataUpload: 'desc' },
  });
}
```

### 6.3 API Route de Upload

```typescript
// app/api/cms/upload/route.ts
import { uploadImage, deleteImage } from '@/lib/blob-storage';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth || auth.tipoUsuario !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const usoEm = formData.get('usoEm') as string;

  try {
    const { url, size } = await uploadImage(file, {
      usuarioId: auth.id,
      usoEm: usoEm as any,
    });

    const imagem = await prisma.midiaImagem.findFirst({
      where: { urlPublica: url },
    });

    return NextResponse.json({
      id: imagem?.id,
      url,
      size,
      usoEm,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth || auth.tipoUsuario !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL obrigatória' },
      { status: 400 }
    );
  }

  try {
    await deleteImage(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

---

## 7. ESTRATÉGIA DE VÍDEOS EXTERNOS

### 7.1 Suporte de Plataformas

```
PLATAFORMAS SUPORTADAS
═════════════════════════════════════════════════════════════════

1️⃣  YOUTUBE
   ├─ Armazenamento: Link do vídeo público
   ├─ Padrão URL: https://youtube.com/watch?v={VIDEO_ID}
   ├─ ID Extração: Usar regex para pegar VIDEO_ID
   ├─ Embedding: <iframe src="https://youtube.com/embed/{ID}">
   ├─ Pros: Gratuito, legal, analytics próprio
   └─ Cons: Publicidade (premium sem anúncios)

2️⃣  VIMEO
   ├─ Armazenamento: Link do vídeo (conta paga)
   ├─ Padrão URL: https://vimeo.com/{VIDEO_ID}
   ├─ ID Extração: Último número da URL
   ├─ Embedding: <iframe src="https://player.vimeo.com/video/{ID}">
   ├─ Pros: Sem publicidade, playerCustomizável
   └─ Cons: Pago, limite de storage

3️⃣  BUNNY CDN (Recomendado para Cursos)
   ├─ Plataforma: Bunny.net Video Streaming
   ├─ Armazenamento: Upload direto para Bunny
   ├─ Padrão URL: https://vod.bunny.net/{VIDEO_ID}/playlist.m3u8
   ├─ ID: Fornecido após upload
   ├─ Embedding: Player customizado do Bunny
   ├─ Pros: CDN rápido, seguro, sem anúncios, controle total
   ├─ Cons: Pago, requer configuração
   └─ Taxa: ~$0.01 por GB de streaming

4️⃣  UPLOAD DIRETO (via Vercel Blob)
   ├─ Armazenamento: Blob Storage Vercel
   ├─ Formato: MP4, WebM
   ├─ Player: Custom HTML5 <video>
   ├─ Pros: Controle total, sem limites, rápido
   ├─ Cons: Caro para volumes altos
   └─ Taxa: ~$0.50 por GB de armazenamento/mês

RECOMENDAÇÃO PARA COMUNIDADE RP
═════════════════════════════════════════════════════════════════

Estratégia Híbrida:
├─ Aulas do Curso: Bunny CDN (melhor performance, sem anúncios)
├─ Operações ao Vivo: YouTube Live (fácil transmitir)
├─ Replays ao Vivo: Bunny ou YouTube
├─ Depoimentos: Vimeo ou YouTube (embeds)
└─ Demo/Trailers: YouTube (maior alcance)
```

### 7.2 Tabela MIDIA_VIDEOS

```sql
-- Já definida acima, mas aqui está o detalhamento

CREATE TABLE midia_videos (
  id CHAR(36) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  url_externa VARCHAR(500) NOT NULL,
  tipo_plataforma ENUM('youtube', 'vimeo', 'bunny', 'outro'),
  video_id_externo VARCHAR(255),  -- ID para extrair da plataforma
  duracao_segundos INT,
  thumbnail_url VARCHAR(500),
  usuario_id CHAR(36),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE
);

-- Usar em AulaS:
ALTER TABLE aulas ADD COLUMN video_midia_id CHAR(36);
ALTER TABLE aulas ADD FOREIGN KEY (video_midia_id) REFERENCES midia_videos(id);
```

### 7.3 Fluxo de Adição de Vídeo

```
ADMIN ADICIONA VÍDEO À AULA
═════════════════════════════════════════════════════════════════

1️⃣  PAINEL ADMIN
   └─ /admin/courses/[courseId]/modules/[moduleId]/lessons/new
      │
      ├─ Formulário:
      │  ├─ Título: "Aula 1 - Introdução ao Trading"
      │  ├─ Descrição: "..."
      │  ├─ Escolher Tipo de Vídeo:
      │  │  ○ YouTube
      │  │  ○ Vimeo
      │  │  ○ Bunny
      │  │  ○ Upload Direto
      │  │
      │  └─ URL/ID do Vídeo: [________________]
      │
      └─ [Salvar]

2️⃣  BACKEND PROCESSA
   │
   ├─ POST /api/admin/lessons
   │
   ├─ Extrai video_id de acordo com tipo:
   │  ├─ YouTube: regex /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
   │  ├─ Vimeo: regex /vimeo\.com\/(\d+)/
   │  ├─ Bunny: Usa ID fornecido
   │  └─ Upload: Cria em Blob Storage
   │
   ├─ Cria MidiaVideo:
   │  INSERT INTO midia_videos (
   │    id, titulo, url_externa, tipo_plataforma,
   │    video_id_externo, duracao_segundos, thumbnail_url,
   │    usuario_id, ativo
   │  ) VALUES (...)
   │
   ├─ Atualiza Aula:
   │  UPDATE aulas SET
   │    video_midia_id = 'uuid-video'
   │  WHERE id = 'uuid-aula'
   │
   └─ Retorna: { id: "uuid-aula", videoMidiaId: "uuid-video" }

3️⃣  FRONTEND RENDERIZA VÍDEO
   │
   ├─ Componente <VideoPlayer>
   │  │
   │  ├─ Props: videoMidia: MidiaVideo
   │  │
   │  ├─ Switch by tipo_plataforma:
   │  │
   │  │  🟢 YOUTUBE:
   │  │  ├─ <iframe
   │  │  │    src={`https://youtube.com/embed/${videoMidia.videoIdExterno}`}
   │  │  │    allowFullScreen
   │  │  │  />
   │  │
   │  │  🟢 VIMEO:
   │  │  ├─ <iframe
   │  │  │    src={`https://player.vimeo.com/video/${videoMidia.videoIdExterno}`}
   │  │  │    allowFullScreen
   │  │  │  />
   │  │
   │  │  🟢 BUNNY:
   │  │  ├─ <BunnyVideoPlayer
   │  │  │    src={videoMidia.urlExterna}
   │  │  │    controls
   │  │  │  />
   │  │
   │  │  🟢 UPLOAD DIRETO:
   │  │  ├─ <video
   │  │  │    src={videoMidia.urlExterna}
   │  │  │    controls
   │  │  │    poster={videoMidia.thumbnailUrl}
   │  │  │  />
   │  │
   │  └─ Rastreia: quando vídeo é pausado, tempo visto, etc
   │
   └─ Salva progresso em UsuarioAula:
      UPDATE usuario_aulas SET
        progresso_percentual = 45.5,
        duracao_assistida_minutos = 12,
        data_visualizacao = NOW()
      WHERE usuario_id = 'uuid' AND aula_id = 'uuid'
```

### 7.4 Componente VideoPlayer

```typescript
// components/video-player.tsx
'use client';

import { MidiaVideo } from '@prisma/client';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  video: MidiaVideo;
  usuarioAulaId: string;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({
  video,
  usuarioAulaId,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);

  useEffect(() => {
    if (video.tipoPlataforma === 'upload_direto' && videoRef.current) {
      const htmlVideoRef = videoRef.current as HTMLVideoElement;

      const handleTimeUpdate = async () => {
        const progress = (htmlVideoRef.currentTime / htmlVideoRef.duration) * 100;
        onProgress?.(progress);

        // Salvar progresso a cada 5 segundos
        if (Math.floor(htmlVideoRef.currentTime) % 5 === 0) {
          await fetch('/api/lessons/track-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuarioAulaId,
              currentTime: htmlVideoRef.currentTime,
              duration: htmlVideoRef.duration,
            }),
          });
        }
      };

      htmlVideoRef.addEventListener('timeupdate', handleTimeUpdate);
      return () => htmlVideoRef.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [video, usuarioAulaId, onProgress]);

  // YouTube
  if (video.tipoPlataforma === 'youtube') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          ref={videoRef as any}
          src={`https://www.youtube.com/embed/${video.videoIdExterno}`}
          title={video.titulo}
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Vimeo
  if (video.tipoPlataforma === 'vimeo') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          ref={videoRef as any}
          src={`https://player.vimeo.com/video/${video.videoIdExterno}`}
          title={video.titulo}
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Upload Direto
  if (video.tipoPlataforma === 'upload_direto') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef as any}
          src={video.urlExterna}
          poster={video.thumbnailUrl || undefined}
          controls
          className="w-full h-full"
        />
      </div>
    );
  }

  // Bunny (requer player específico)
  if (video.tipoPlataforma === 'bunny') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          ref={videoRef as any}
          src={`${video.urlExterna}?autoplay=false`}
          title={video.titulo}
          allowFullScreen
          allow="autoplay"
          className="w-full h-full"
        />
      </div>
    );
  }

  return <div>Tipo de vídeo não suportado</div>;
}
```

---

## 8. ESTRATÉGIA DE PERMISSÕES DE USUÁRIO

### 8.1 Tipos de Usuários

```
HIERARQUIA DE USUÁRIOS
═════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                               │
│ ├─ Acesso completo a TUDO                                        │
│ ├─ Criar/Editar/Deletar: Usuários, Cursos, Planos, CMS          │
│ ├─ Acessar: Todos os painéis, logs, analytics                    │
│ └─ Permissão: admin                                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      MODERADOR                                   │
│ ├─ Moderar comunidade (aprovar/rejeitar posts)                   │
│ ├─ Gerenciar tickets de suporte                                  │
│ ├─ Ver analytics (leitura)                                       │
│ ├─ Deletar posts/comentários abusivos                            │
│ └─ Permissão: moderador                                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      INSTRUTOR                                   │
│ ├─ Criar/Editar/Publicar seus próprios cursos                    │
│ ├─ Editar aulas de seus cursos                                   │
│ ├─ Ver progresso dos alunos (apenas seus cursos)                 │
│ ├─ Gerenciar downloads de seus cursos                            │
│ ├─ Não pode: Editar cursos de outros, deletar usuários          │
│ └─ Permissão: instrutor                                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  MEMBRO PREMIUM                                  │
│ ├─ Acesso a TODOS os cursos publicados                           │
│ ├─ Acessar ferramentas: Copy Trader, IA, Forex                   │
│ ├─ Grupo VIP: criar posts, comentários, reações                  │
│ ├─ Operações ao vivo: assistir transmissões                      │
│ ├─ Downloads: de todos os materiais                              │
│ ├─ Suporte: ticketprioridade média                               │
│ └─ Permissão: membro_premium                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  MEMBRO BÁSICO                                   │
│ ├─ Acesso limitado: alguns cursos gratuitos                      │
│ ├─ Comunidade: apenas leitura (sem posts)                        │
│ ├─ Sem acesso a ferramentas premium                              │
│ ├─ Suporte: ticketsprioridade baixa                              │
│ └─ Permissão: membro_basico (default)                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      VISITANTE                                   │
│ ├─ Sem autenticação                                              │
│ ├─ Acesso: apenas páginas públicas (home, about, pricing)        │
│ ├─ Sem acesso a: cursos, comunidade, ferramentas                 │
│ └─ Pode: se registrar, ver preview de cursos                     │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Sistema de Permissões Granulares

```
TABELA PERMISSOES (para casos específicos)
═════════════════════════════════════════════════════════════════

Usuario 1:1 Assinatura
├─ Plano → Features JSON (define permissões padrão)
│
└─ Permissões Adicionais (Tabela: permissoes)
   ├─ Global: view_admin_panel, manage_users, etc
   ├─ Por recurso: edit_curso_{cursoId}, delete_usuario_{usuarioId}
   ├─ Temporal: data_expiracao para permissões temporárias
   └─ Escopo: tabela_alvo + recurso_alvo


EXEMPLOS DE PERMISSÕES
═════════════════════════════════════════════════════════════════

📌 Global (sem escopo específico):
   tipo_permissao: 'view_admin_panel'
   tabela_alvo: NULL
   recurso_alvo: NULL
   → Usuário pode acessar painel admin

📌 Por Tabela:
   tipo_permissao: 'view_cursos'
   tabela_alvo: 'cursos'
   recurso_alvo: NULL
   → Usuário pode ver todos os cursos

📌 Por Recurso Específico:
   tipo_permissao: 'edit_curso'
   tabela_alvo: 'cursos'
   recurso_alvo: 'uuid-curso-123'
   → Apenas o instrutor pode editar este curso

📌 Temporária:
   tipo_permissao: 'acesso_ferramenta_ia'
   tabela_alvo: 'tools'
   recurso_alvo: 'ai_analysis'
   data_expiracao: '2026-01-31 23:59:59'
   → Acesso expira em 31 de janeiro

MAPEAMENTO DE PERMISSÕES POR TIPO DE USUÁRIO
═════════════════════════════════════════════════════════════════

🔴 ADMIN:
   view_admin_panel ✓
   manage_users ✓
   manage_courses ✓
   manage_payments ✓
   manage_cms ✓
   manage_permissions ✓
   view_analytics ✓
   delete_usuarios ✓

🟠 MODERADOR:
   view_community ✓
   moderate_posts ✓
   moderate_comments ✓
   manage_support_tickets ✓
   view_analytics (limitado) ✓

🟡 INSTRUTOR:
   create_curso ✓
   edit_curso (apenas próprios) ✓
   view_student_progress (apenas alunos) ✓
   manage_course_modules ✓
   manage_course_lessons ✓
   upload_materiais ✓

🟢 MEMBRO_PREMIUM:
   view_cursos ✓
   complete_cursos ✓
   access_ferramentas_premium ✓
   create_community_posts ✓
   view_live_operations ✓
   download_materiais ✓

🔵 MEMBRO_BASICO:
   view_public_cursos ✓
   view_community (readonly) ✓
   update_perfil ✓
   create_suporte_ticket ✓

⚪️ VISITANTE:
   view_public_pages ✓
   create_account ✓
   view_pricing ✓
```

### 8.3 Middleware de Autenticação e Permissões

```typescript
// middleware/auth-permission.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function verificarPermissao(
  token: string,
  tipoPermissao: string,
  recursoAlvo?: string
): Promise<boolean> {
  try {
    const payload = await verifyJWT(token);
    const usuarioId = payload.sub;

    // 1. Se é admin, permissão automática
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (usuario?.tipoUsuario === 'admin') {
      return true;
    }

    // 2. Verificar em tabela de permissões
    const permissao = await prisma.permissao.findFirst({
      where: {
        usuarioId,
        tipoPermissao,
        recursoAlvo: recursoAlvo || null,
        ativo: true,
        OR: [
          { dataExpiracao: null },
          { dataExpiracao: { gt: new Date() } },
        ],
      },
    });

    return !!permissao;
  } catch {
    return false;
  }
}

// middleware.ts (aplicar globalmente)
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas públicas (sem autenticação)
  const rotasPublicas = [
    '/',
    '/about',
    '/benefits',
    '/pricing',
    '/contact',
    '/login',
    '/register',
  ];

  if (rotasPublicas.includes(pathname)) {
    return NextResponse.next();
  }

  // Rotas de membros (requer autenticação)
  if (pathname.startsWith('/members')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await verifyJWT(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Rotas de admin (requer admin)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const isAdmin = await verificarPermissao(token, 'view_admin_panel');

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/members', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 9. ESTRATÉGIA DE SEO DINÂMICO

### 9.1 Tabela CMSConfiguracao para SEO Global

```typescript
// Configurações SEO armazenadas em CMSConfiguracao:

// Exemplo 1: Meta Tags Globais
{
  chave: 'seo_site_title',
  valorTexto: 'Comunidade RP - Trading Premium',
  tipoValor: 'texto'
}

{
  chave: 'seo_site_description',
  valorTexto: 'Aprenda trading de verdade com a Comunidade RP. Cursos, grupo VIP, operações ao vivo e ferramentas exclusivas.',
  tipoValor: 'texto'
}

{
  chave: 'seo_site_keywords',
  valorTexto: 'trading, cursos trading, grupo vip, copy trader, análises forex',
  tipoValor: 'texto'
}

// Exemplo 2: OpenGraph
{
  chave: 'og_image_default',
  valorTexto: 'https://blob.vercel.sh/og-image.jpg',
  tipoValor: 'url'
}

{
  chave: 'og_type',
  valorTexto: 'website',
  tipoValor: 'texto'
}

{
  chave: 'og_locale',
  valorTexto: 'pt_BR',
  tipoValor: 'texto'
}

// Exemplo 3: Estruturado (Schema.org)
{
  chave: 'schema_organization',
  valorJson: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Comunidade RP",
    "url": "https://comunidaderp.com",
    "logo": "https://blob.vercel.sh/logo.png",
    "sameAs": ["https://facebook.com/...", "https://instagram.com/..."],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "telephone": "+55 11 9999-9999",
      "email": "suporte@comunidaderp.com"
    }
  }),
  tipoValor: 'json'
}

// Exemplo 4: Configurações Técnicas
{
  chave: 'robots_txt',
  valorTexto: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: https://comunidaderp.com/sitemap.xml`,
  tipoValor: 'texto'
}

{
  chave: 'canonical_url',
  valorTexto: 'https://comunidaderp.com',
  tipoValor: 'url'
}
```

### 9.2 Meta Tags Dinâmicas por Página

```typescript
// lib/seo.ts
import { prisma } from '@/lib/prisma';

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  schema?: Record<string, any>;
}

export async function getSEOMetadata(
  slug: string
): Promise<SEOMetadata> {
  // 1. Buscar página no CMS
  const pagina = await prisma.cMSPagina.findUnique({
    where: { slug },
  });

  if (!pagina) {
    // Retornar meta default
    return getDefaultSEO();
  }

  // 2. Construir metadata
  const metadata: SEOMetadata = {
    title: pagina.metaTitle || pagina.titulo,
    description: pagina.metaDescription || '',
    keywords: pagina.metaKeywords || '',
    ogImage: pagina.ogImageUrl || (await getOGImageDefault()),
    canonicalUrl: `https://comunidaderp.com/${slug}`,
    robotsIndex: pagina.ativo,
  };

  // 3. Se é página de produto (curso), adicionar schema
  if (pagina.tipoPagina === 'curso') {
    metadata.schema = await generateCourseSchema(slug);
  }

  return metadata;
}

async function getOGImageDefault(): Promise<string> {
  const config = await prisma.cMSConfiguracao.findUnique({
    where: { chave: 'og_image_default' },
  });
  return config?.valorTexto || 'https://blob.vercel.sh/default-og.jpg';
}

async function getDefaultSEO(): Promise<SEOMetadata> {
  const [siteTitle, siteDesc, siteKeywords, ogImage] = await Promise.all([
    prisma.cMSConfiguracao.findUnique({
      where: { chave: 'seo_site_title' },
    }),
    prisma.cMSConfiguracao.findUnique({
      where: { chave: 'seo_site_description' },
    }),
    prisma.cMSConfiguracao.findUnique({
      where: { chave: 'seo_site_keywords' },
    }),
    prisma.cMSConfiguracao.findUnique({
      where: { chave: 'og_image_default' },
    }),
  ]);

  return {
    title: siteTitle?.valorTexto || 'Comunidade RP',
    description:
      siteDesc?.valorTexto ||
      'Aprenda trading com a Comunidade RP',
    keywords: siteKeywords?.valorTexto || 'trading',
    ogImage: ogImage?.valorTexto || '',
    canonicalUrl: 'https://comunidaderp.com',
    robotsIndex: true,
  };
}

async function generateCourseSchema(slug: string): Promise<Record<string, any>> {
  const curso = await prisma.curso.findUnique({
    where: { slug },
    include: { instrutor: true },
  });

  if (!curso) return {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: curso.titulo,
    description: curso.descricao,
    image: curso.imagemCapa,
    provider: {
      '@type': 'Organization',
      name: 'Comunidade RP',
      sameAs: 'https://comunidaderp.com',
    },
    instructor: {
      '@type': 'Person',
      name: curso.instrutor.nome,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
    },
  };
}
```

### 9.3 Layout.tsx com Meta Tags Dinâmicas

```typescript
// app/layout.tsx
import { getSEOMetadata } from '@/lib/seo';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

interface RootLayoutProps {
  children: ReactNode;
  params: { slug?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOMetadata('/');

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.robotsIndex ? 'index, follow' : 'noindex, nofollow',
    canonical: seo.canonicalUrl,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      url: seo.canonicalUrl,
      siteName: 'Comunidade RP',
      images: [{ url: seo.ogImage }],
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
  };
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 9.4 Sitemap.xml Dinâmico

```typescript
// app/sitemap.ts
import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://comunidaderp.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://comunidaderp.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://comunidaderp.com/courses',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://comunidaderp.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Páginas CMS dinâmicas
  const cmsPages = await prisma.cMSPagina.findMany({
    where: { ativo: true },
  });

  const cmsPagesSitemap: MetadataRoute.Sitemap = cmsPages.map((page) => ({
    url: `https://comunidaderp.com/${page.slug}`,
    lastModified: page.dataAtualizacao,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Cursos
  const courses = await prisma.curso.findMany({
    where: { status: 'publicado', ativo: true },
  });

  const coursesSitemap: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `https://comunidaderp.com/courses/${course.slug}`,
    lastModified: course.dataAtualizacao,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cmsPagesSitemap, ...coursesSitemap];
}
```

### 9.5 Robots.txt Dinâmico

```typescript
// app/robots.ts
import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const robotsConfig = await prisma.cMSConfiguracao.findUnique({
    where: { chave: 'robots_txt' },
  });

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/members'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://comunidaderp.com/sitemap.xml',
  };
}
```

---

## 10. VALIDAÇÃO DE INTEGRIDADE

### 10.1 Checklist de Integridade do Banco

```
✅ VALIDAÇÕES SQL E CONSTRAINTS
═════════════════════════════════════════════════════════════════

Tabelas Base:
 □ usuarios (PK: id, UNIQUE: email, status DEFAULT 'ativo')
 □ assinaturas (UNIQUE: usuario_id, FK: usuario_id, plano_id)
 □ planos (UNIQUE: nome, ativo DEFAULT TRUE)
 □ sessoes_jwt (UNIQUE: token_hash, FK: usuario_id)
 □ permissoes (UNIQUE: usuario_id, tipo_permissao, tabela_alvo, recurso_alvo)

Tabelas de Conteúdo:
 □ cursos (PK: id, UNIQUE: slug, FK: instrutor_id, ativo DEFAULT TRUE)
 □ modulos (UNIQUE: curso_id + numero_ordem, FK: curso_id)
 □ aulas (UNIQUE: modulo_id + numero_ordem, FK: modulo_id)
 □ usuario_cursos (UNIQUE: usuario_id + curso_id)
 □ usuario_aulas (UNIQUE: usuario_id + aula_id)

Tabelas de CMS:
 □ cms_paginas (UNIQUE: slug, ativo DEFAULT TRUE)
 □ cms_blocos (UNIQUE: pagina_id + posicao_ordem)
 □ cms_conteudo (UNIQUE: bloco_id + chave)
 □ cms_configuracoes (UNIQUE: chave)

Tabelas de Mídia:
 □ midia_imagens (FK: usuario_id, ativo DEFAULT TRUE)
 □ midia_videos (FK: usuario_id, ativo DEFAULT TRUE)
 □ midia_downloads (FK: curso_id, usuario_id_criador)

Tabelas de Comunidade:
 □ comunidade_posts (FK: usuario_id, ativo DEFAULT TRUE)
 □ comunidade_comentarios (UNIQUE: usuario_id + post_id + comentario_id)
 □ comunidade_reacoes (unique_reacao constraint)

Tabelas de Operações:
 □ operacoes_ao_vivo (FK: usuario_criador_id, ativo DEFAULT TRUE)
 □ operacoes_trades (FK: operacao_id)
 □ operacoes_replays (UNIQUE: operacao_id)

Tabelas de Pagamentos:
 □ pagamentos (FK: usuario_id, assinatura_id, ativo DEFAULT TRUE)
 □ faturas (FK: pagamento_id, UNIQUE: numero_fatura)

Tabelas de Auditoria:
 □ log_auditoria (FK: usuario_id)
 □ webhooks_log (ativo DEFAULT TRUE)

Tabelas de Suporte:
 □ suporte_tickets (FK: usuario_id, atendente_id, ativo DEFAULT TRUE)
 □ suporte_mensagens (FK: ticket_id, usuario_id)

✅ ÍNDICES OBRIGATÓRIOS
═════════════════════════════════════════════════════════════════

 □ Todas as Foreign Keys tem INDEX
 □ Campos com filtros frequentes tem INDEX (status, ativo, datas)
 □ Campos UNIQUE tem UNIQUE INDEX (implícito)
 □ Busca por texto (nome, email, titulo) tem FULLTEXT INDEX (opcional)

✅ DADOS INICIAIS (SEED)
═════════════════════════════════════════════════════════════════

 □ Criar 3 Planos (Básico, Premium, Pro)
 □ Criar Super Admin User
 □ Criar CMSPaginas padrão (home, about, benefits, etc)
 □ Criar CMSBlocos para cada página
 □ Criar CMSConfiguracoes (logo, favicon, whatsapp, etc)

✅ RELACIONAMENTOS BIDIRECIONAIS
═════════════════════════════════════════════════════════════════

 □ Usuário → Assinatura (1:1)
 □ Usuário → Permissões (1:N)
 □ Usuário → Sessões JWT (1:N)
 □ Usuário → Cursos Instruídos (1:N)
 □ Curso → Módulos (1:N) → Aulas (1:N)
 □ Usuário → Cursos (N:M via UsuarioCurso)
 □ Usuário → Aulas (N:M via UsuarioAula)
 □ CMSPágina → Blocos (1:N) → Conteúdos (1:N)
 □ Operação → Trades (1:N)
 □ Post → Comentários (1:N)
 □ Comentário → Replies (Self-Join)
 □ Usuário → Reações (N:M)
```

---

## CONCLUSÃO

Este banco de dados foi projetado para ser:

✅ **Escalável** - Suporta crescimento horizontal  
✅ **Seguro** - Constraints, tipos fortes, RLS-ready  
✅ **Flexível** - CMS dinâmico sem código  
✅ **Performático** - Índices otimizados, queries eficientes  
✅ **Auditável** - Log de todas as ações  
✅ **Robusto** - Cascades, validações, integridade referencial  

Próximo passo: Gerar migrações Prisma e criar seeders com dados iniciais.
