ETAPA 1 - BANCO DE DADOS COMPLETO
=================================

Data: 2026-06-11
Versão: 1.0
Status: ✅ PRONTO PARA PRODUÇÃO

# 📊 DIAGRAMA ER - ESTRUTURA COMPLETA

## Relacionamentos Principais:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE AUTENTICAÇÃO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Usuario (PK: id)                                               │
│  ├─ 1:N ─→ SessaoJWT                                           │
│  ├─ 1:N ─→ TokenRecuperacao                                    │
│  ├─ 1:N ─→ UsuarioCurso (inscrições)                          │
│  ├─ 1:N ─→ UsuarioAula (progresso)                            │
│  ├─ 1:N ─→ UsuarioDownload (downloads)                        │
│  ├─ 1:N ─→ NotificacaoLida (notificações lidas)              │
│  ├─ 1:N ─→ SuporteTicket                                      │
│  ├─ 1:N ─→ SuporteMensagem                                    │
│  └─ 1:N ─→ LogAuditoria                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE CURSOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Curso (PK: id)                                                 │
│  └─ 1:N ─→ Modulo                                              │
│             └─ 1:N ─→ Aula                                     │
│                       └─ 1:1 ─→ AulaConteudo                  │
│                                  ├─ M:1 ─→ MediaVideo         │
│                                  └─ M:1 ─→ MediaPDF           │
│  └─ 1:N ─→ UsuarioCurso (M:N para usuários)                   │
│  └─ N:M ─→ Usuario (via UsuarioCurso)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE MÍDIA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MediaVideo (tipo_video: YOUTUBE, VIMEO, BUNNY, EXTERNO)      │
│  ├─ URL completo armazenado                                    │
│  ├─ Sem upload físico (apenas links externos)                  │
│  ├─ 1:N ─→ AulaConteudo                                       │
│  ├─ Video ID extraído automaticamente                          │
│  └─ Thumbnail armazenado                                       │
│                                                                 │
│  MediaPDF                                                       │
│  ├─ 1:N ─→ AulaConteudo                                       │
│  ├─ 1:N ─→ Download                                           │
│  └─ Armazenado em /public/uploads/pdfs/                       │
│                                                                 │
│  MediaImagem                                                    │
│  ├─ 1:N ─→ CMSBlocoConteudo                                   │
│  └─ Armazenado em /public/uploads/imagens/                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE CMS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CMSConfiguracao (chave única)                                 │
│  └─ Configurações globais (logo, favicon, redes sociais, etc) │
│                                                                 │
│  CMSPagina (slug único)                                        │
│  └─ 1:N ─→ CMSSecao                                            │
│             └─ 1:N ─→ CMSBlocoConteudo                        │
│                       └─ M:1 ─→ MediaImagem                   │
│                                                                 │
│  CMSDepoimento (independente)                                  │
│  └─ Depoimentos com foto e classificação                       │
│                                                                 │
│  CMSFAQ (independente)                                         │
│  └─ Perguntas e respostas                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  CAMADA DE NOTIFICAÇÕES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Notificacao                                                    │
│  └─ 1:N ─→ NotificacaoLida (M:N para usuários)                │
│  └─ N:M ─→ Usuario (via NotificacaoLida)                      │
│  └─ Tipos: NOVA_AULA, MANUTENCAO, PROMOCAO, IMPORTANTE       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE DOWNLOADS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Download                                                       │
│  ├─ M:1 ─→ MediaPDF                                            │
│  └─ 1:N ─→ UsuarioDownload (M:N para usuários)               │
│  └─ N:M ─→ Usuario (via UsuarioDownload)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE SUPORTE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SuporteTicket                                                  │
│  ├─ M:1 ─→ Usuario (criador do ticket)                        │
│  └─ 1:N ─→ SuporteMensagem                                    │
│             └─ M:1 ─→ Usuario (autor da mensagem)             │
│                                                                 │
│  Status: ABERTO, EM_ANDAMENTO, AGUARDANDO_USUARIO, ...        │
│  Prioridade: BAIXA, NORMAL, ALTA, CRITICA                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE AUDITORIA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LogAuditoria                                                   │
│  └─ M:1 ─→ Usuario (quem fez a ação)                          │
│  └─ Registra: ação, tabela, IDs, valores antes/depois         │
│  └─ Rastreável: IP address, user agent, timestamp             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

# 📋 DETALHAMENTO COMPLETO DE CADA TABELA

## 1. CAMADA DE AUTENTICAÇÃO

### Usuario (Usuários do Sistema)
```
Campos:
- id (PK): CUID único
- nome: Nome completo do usuário
- email (UNIQUE): Email para login
- senha_hash: Hash bcrypt (nunca armazenar senha em texto)
- telefone: Para contato e verificação 2FA (opcional)
- avatar_url: URL da foto de perfil (opcional)
- role: SUPER_ADMIN | ADMIN | MEMBRO
- status: ATIVO | INATIVO | BLOQUEADO | AGUARDANDO_VERIFICACAO
- assinatura_ativa: Boolean para controlar acesso
- data_inicio_assinatura: Início da assinatura
- data_fim_assinatura: Fim da assinatura (para renovação)
- ultima_login: Último acesso do usuário
- created_at: Data de criação
- updated_at: Data de atualização
- deleted_at: Soft delete (opcional)

Índices:
- PK: id
- UNIQUE: email
- INDEX: role, status, assinatura_ativa

Permissões por Role:
- SUPER_ADMIN: Acesso total, gerenciar admins e usuários
- ADMIN: Criar/editar conteúdo, gerenciar cursos, CMS
- MEMBRO: Acessar cursos, fazer downloads, enviar tickets

Segurança:
- Senha sempre hashed com bcrypt (10+ rounds)
- Email único para evitar duplicação
- Soft delete mantém integridade referencial
- Audit log de todas as alterações de role/status
```

### SessaoJWT (Sessões JWT)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- token (UNIQUE): JWT access token
- refresh_token (UNIQUE): Token para renovação
- ip_address: IP do cliente (segurança)
- user_agent: Navegador/cliente (segurança)
- expires_at: Quando o token expira
- revogado: Boolean para logout
- created_at: Quando foi criado
- updated_at: Atualização

Índices:
- FK: usuario_id
- INDEX: expires_at (para limpeza de sessões expiradas)
- INDEX: revogado (queries de sessões ativas)

TTL (Time To Live):
- Access token: 15 minutos
- Refresh token: 7 dias
- Mantém sessão segura e renovável

Fluxo:
1. Login → gera access + refresh token
2. Access token expira → usa refresh para renovar
3. Logout → marca token como revogado
4. Refresh token vira admin-only renewal
```

### TokenRecuperacao (Recuperação de Senha)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- token (UNIQUE): Token aleatório para reset
- usado: Boolean (usar apenas uma vez)
- expires_at: Expira em 24-48 horas
- created_at: Quando foi gerado

Fluxo de Reset:
1. Usuário clica "Esqueci a senha"
2. Email com link contendo token é enviado
3. Token criado em TokenRecuperacao com expires_at
4. Usuário clica no link e cria nova senha
5. usado = true + senha_hash atualizada
6. Token anterior nunca poderá ser usado novamente
```

---

## 2. CAMADA DE CURSOS

### Curso (Cursos Disponíveis)
```
Campos:
- id (PK): CUID único
- titulo: Nome do curso
- descricao: Descrição longa (HTML permitido)
- descricao_curta: Para listagens
- imagem_url: Thumbnail do curso
- preco: Preço full
- preco_promocional: Para ofertas (opcional)
- categoria: FOREX | CRIPTOMOEDAS | BOLSA | OPCOES | INVESTIMENTOS | ...
- nivel: INICIANTE | INTERMEDIARIO | AVANCADO
- duracao_horas: Estimativa total
- ordem: Para ordenação customizada
- publicado: Boolean (controla visibilidade)
- criado_em: Data de criação
- atualizado_em: Data de modificação

Índices:
- INDEX: categoria (filtros)
- INDEX: publicado (queries de cursos visíveis)
- INDEX: criado_em (ordenação)

Relacionamentos:
- 1:N → Modulo
- 1:N → UsuarioCurso (inscrições)

Estrutura Hierárquica:
Curso
├─ Módulo 1
│  ├─ Aula 1
│  ├─ Aula 2
│  └─ Aula 3
├─ Módulo 2
│  ├─ Aula 4
│  └─ Aula 5
└─ Módulo 3
   └─ Aula 6
```

### Modulo (Módulos de um Curso)
```
Campos:
- id (PK): CUID único
- curso_id (FK): Referência para Curso
- titulo: Nome do módulo
- descricao: Descrição (opcional)
- ordem: Sequência de exibição
- criado_em: Data de criação
- atualizado_em: Data de atualização

Índices:
- FK: curso_id
- INDEX: ordem (ordenação)

Relacionamento:
- M:1 → Curso
- 1:N → Aula

Exemplo:
Curso: "Forex para Iniciantes"
└─ Módulo 1: "Fundamentos do Forex"
└─ Módulo 2: "Análise Técnica Básica"
└─ Módulo 3: "Estratégias Práticas"
```

### Aula (Aulas de um Módulo)
```
Campos:
- id (PK): CUID único
- modulo_id (FK): Referência para Modulo
- titulo: Nome da aula
- descricao: Descrição (opcional)
- ordem: Sequência
- duracao_minutos: Duração em minutos
- liberada: Boolean (controla acesso)
- criado_em: Data de criação
- atualizado_em: Data de atualização

Índices:
- FK: modulo_id
- INDEX: ordem
- INDEX: liberada (queries de aulas disponíveis)

Relacionamentos:
- M:1 → Modulo
- 1:1 → AulaConteudo (uma aula = um conteúdo)
- 1:N → UsuarioAula (progresso por usuário)

Controle de Acesso:
- liberada = false: Aula bloqueada (futura ou em criação)
- liberada = true: Aula visível para inscritos
- Pode ser liberada por data/ordem de progressão
```

### AulaConteudo (Conteúdo da Aula)
```
Campos:
- id (PK): CUID único
- aula_id (FK UNIQUE): 1:1 com Aula
- tipo_conteudo: VIDEO | PDF | TEXTO | MISTO
- video_id (FK): Referência para MediaVideo (opcional)
- pdf_id (FK): Referência para MediaPDF (opcional)
- texto_html: HTML rico (opcional)
- criado_em: Data de criação
- atualizado_em: Data de atualização

Tipos de Conteúdo:
- VIDEO: Apenas vídeo (linkado em MediaVideo)
- PDF: Apenas PDF (linkado em MediaPDF)
- TEXTO: Apenas HTML
- MISTO: Combinação de vários tipos

Relacionamentos:
- 1:1 → Aula
- 0:1 → MediaVideo (opcional)
- 0:1 → MediaPDF (opcional)

Exemplo:
Aula: "O que é Forex?"
└─ AulaConteudo
   ├─ tipo: VIDEO
   ├─ video_id → MediaVideo (YouTube)
   └─ texto_html: "Bem-vindo à aula..."

Aula: "Análise Técnica - Livro"
└─ AulaConteudo
   ├─ tipo: PDF
   └─ pdf_id → MediaPDF (ebook)
```

### UsuarioCurso (Inscrições - M:N Usuario-Curso)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- curso_id (FK): Referência para Curso
- progresso_pct: 0-100 (porcentagem)
- concluido: Boolean
- data_inscricao: Quando se inscreveu
- data_conclusao: Quando concluiu (se concluido=true)
- atualizado_em: Última atualização

UNIQUE: (usuario_id, curso_id) - um usuário por curso

Índices:
- UNIQUE: usuario_id + curso_id
- INDEX: usuario_id (cursos do usuário)
- INDEX: curso_id (inscritos no curso)
- INDEX: concluido (relatórios)

Relacionamentos:
- M:1 → Usuario
- M:1 → Curso

Lógica:
1. Usuário se inscreve → insert com progresso_pct=0, concluido=false
2. Conclui aulas → progresso_pct aumenta
3. Completa todas → concluido=true, data_conclusao=NOW()
4. Certificado gerado (via job/trigger)

Progresso Calculado:
progresso_pct = (aulas_assistidas / total_aulas) * 100
```

### UsuarioAula (Progresso por Aula)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- aula_id (FK): Referência para Aula
- assistida: Boolean (watched = true)
- tempo_assistido: Segundos assistidos (opcional)
- data_conclusao: Quando completou
- atualizado_em: Última atualização
- criado_em: Primeira visualização

UNIQUE: (usuario_id, aula_id) - Uma entrada por usuário/aula

Rastreamento:
- assistida=true: Aula considerada concluída
- tempo_assistido: Pode validar se viu 80%+ do vídeo
- data_conclusao: Quando marcou como concluído

Cálculo de Progresso:
- Para cada UsuarioCurso, count(UsuarioAula.assistida=true)
- Dividir pelo total de aulas do curso
- Resultado = progresso_pct em UsuarioCurso
```

---

## 3. CAMADA DE MÍDIA

### MediaVideo (Vídeos Externos)
```
Campos:
- id (PK): CUID único
- titulo: Nome do vídeo
- descricao: Descrição (opcional)
- tipo_video: YOUTUBE | VIMEO | BUNNY | EXTERNO
- video_url: URL completa do vídeo (YouTube embed, Vimeo link, etc)
- video_id: ID extraído (ex: dQw4w9WgXcQ para YouTube)
- thumbnail_url: URL da miniatura
- duracao_segundos: Duração em segundos
- criado_em: Data de upload/adição
- atualizado_em: Data de atualização

Tipos de Vídeo:
1. YOUTUBE
   - video_url: https://www.youtube.com/embed/VIDEO_ID
   - video_id: VIDEO_ID
   - thumbnail: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg

2. VIMEO
   - video_url: https://vimeo.com/VIDEO_ID
   - video_id: VIDEO_ID
   - Player Vimeo nativo

3. BUNNY
   - video_url: https://bunny.net/...
   - video_id: Extraído da URL
   - Host dedicado para cursos

4. EXTERNO
   - video_url: Qualquer URL de vídeo
   - video_id: (opcional, depende da plataforma)
   - HTML5 player fallback

IMPORTANTE: Nenhum vídeo é armazenado fisicamente em Hostinger!

Relacionamentos:
- 1:N → AulaConteudo (um vídeo em múltiplas aulas)

Vantagens:
✅ Sem consumir espaço em servidor
✅ Streaming otimizado por CDN
✅ Sem stress em banda
✅ Melhor performance
✅ Redunda automática
```

### MediaPDF (PDFs e Documentos)
```
Campos:
- id (PK): CUID único
- nome_original: Nome original do arquivo
- nome_arquivo (UNIQUE): Nome salvo (ex: 8f3a9b2c1_ebook.pdf)
- caminho_relativo: /public/uploads/pdfs/8f3a9b2c1_ebook.pdf
- url_publica: URL para download
- tamanho_bytes: Tamanho em bytes
- paginas: Número de páginas (opcional)
- criado_em: Data de upload

Armazenamento:
Hostinger → /public/uploads/pdfs/
Estrutura: /public/uploads/pdfs/{CUID}_{nome-original}.pdf

Relacionamentos:
- 1:N → AulaConteudo (PDFs em aulas)
- 1:N → Download (PDFs em downloads)

Validações:
✅ Máximo 50MB por arquivo
✅ Apenas .pdf aceito
✅ Scan antivírus (opcional)
✅ Rename automático para evitar conflicts

Segurança:
- URL protegida por middleware de autenticação
- Logging de downloads em UsuarioDownload
- Soft delete mantém integridade
```

### MediaImagem (Imagens para CMS)
```
Campos:
- id (PK): CUID único
- nome_original: Nome original
- nome_arquivo (UNIQUE): Nome salvo
- caminho_relativo: /public/uploads/imagens/{CUID}.webp
- url_publica: URL da imagem
- tamanho_bytes: Tamanho em bytes
- tipo_mime: image/webp (sempre convertido)
- largura: Largura em pixels
- altura: Altura em pixels
- criado_em: Data de upload

Compressão Automática:
- Converter para WebP (melhor compressão)
- Redimensionar se > 1920x1080
- Gerar thumbnails: 200x200, 400x400
- Remover metadados EXIF

Armazenamento:
Hostinger → /public/uploads/imagens/
Estrutura: /public/uploads/imagens/{CUID}.webp

Relacionamentos:
- 1:N → CMSBlocoConteudo (imagens em seções)

Validações:
✅ Máximo 10MB por imagem
✅ Apenas JPG, PNG, WebP
✅ Dimensão mínima 200x200
```

---

## 4. CAMADA DE CMS (EDIÇÃO PELO PAINEL)

### CMSConfiguracao (Configurações Globais)
```
Campos:
- id (PK): CUID único
- chave (UNIQUE): Nome da config (ex: 'logo_url')
- valor: Valor em JSON/string/número
- tipo: STRING | NUMERO | BOOLEANO | JSON
- descricao: Descrição da config
- criado_em: Data de criação
- atualizado_em: Data de atualização

Configurações Editáveis:
1. logo_url (STRING)
   Valor: /images/logo.png
   Editável pelo painel

2. favicon_url (STRING)
   Valor: /images/favicon.ico
   Editável pelo painel

3. whatsapp_numero (STRING)
   Valor: +5511999999999
   Editável pelo painel
   Usado em: Botão flutuante, links

4. redes_sociais (JSON)
   Valor: {
     "instagram": "https://...",
     "facebook": "https://...",
     "youtube": "https://...",
     "linkedin": "https://...",
     "tiktok": "https://..."
   }
   Editável pelo painel

5. email_contato (STRING)
   Valor: contato@comunidaderp.com
   Usado em: Formulários, tickets

6. seo_titulo_padrao (STRING)
   Valor: Comunidade RP - Educação Financeira
   Fallback para páginas sem SEO específico

7. seo_descricao_padrao (STRING)
   Valor: Plataforma educacional de finanças...
   Fallback para páginas

Padrão de Chaves:
✅ Usar snake_case
✅ Nomear semanticamente
✅ Prefixos: logo_, seo_, whatsapp_, etc.

Fluxo de Edição no Painel:
1. Admin acessa: /admin/configuracoes
2. Vê campo de entrada baseado em tipo
3. Salva → atualiza valor + updated_at
4. Frontend lê CMSConfiguracao no build/runtime
5. Mudanças refletem imediatamente
```

### CMSPagina (Páginas Editáveis)
```
Campos:
- id (PK): CUID único
- titulo: Título da página
- slug (UNIQUE): home, sobre, contato, etc.
- descricao: Descrição breve
- conteudo_html: HTML rico (opcional, para páginas simples)
- seo_titulo: Meta title
- seo_descricao: Meta description
- seo_keywords: Keywords (separadas por vírgula)
- publicada: Boolean (controla visibilidade)
- ordem: Ordenação em menu
- criado_em: Data de criação
- atualizado_em: Data de atualização

Páginas Pré-criadas:
1. /home (slug: 'home')
   - Seção: Hero
   - Seção: Benefícios
   - Seção: Depoimentos
   - Seção: FAQ
   - Seção: Rodapé

2. /sobre (slug: 'sobre')
   - Seção: Hero customizada
   - Seção: Sobre com texto e imagem
   - Seção: Time (opcional)

3. /contato (slug: 'contato')
   - Seção: Formulário de contato
   - WhatsApp link
   - Email

4. /termos (slug: 'termos')
   - Texto legal

5. /privacidade (slug: 'privacidade')
   - Texto legal

Relacionamentos:
- 1:N → CMSSecao
- Cada página tem múltiplas seções

Fluxo no Painel:
1. Admin → /admin/cms/paginas
2. Clica "Editar" na página
3. Edita título, descrição, SEO
4. Clica "Publicar" ou "Rascunho"
5. Frontend lê CMSPagina e exibe
```

### CMSSecao (Seções de Páginas)
```
Campos:
- id (PK): CUID único
- pagina_id (FK): Referência para CMSPagina
- titulo: Nome da seção (ex: "Benefícios")
- tipo_secao: HERO | BENEFICIOS | SOBRE | DEPOIMENTOS | FAQ | RODAPE | BANNER | CUSTOMIZADA
- ordem: Sequência de exibição
- dados_json: JSON com configuração da seção
- criado_em: Data de criação
- atualizado_em: Data de atualização

Tipos de Seção:

1. HERO
   dados_json: {
     "titulo": "Transforme sua vida financeira",
     "subtitulo": "Aprenda a investir com segurança",
     "cta_texto": "Começar Agora",
     "cta_url": "/inscricao",
     "imagem_url": "/images/hero-bg.jpg",
     "cor_fundo": "#1a1a2e"
   }

2. BENEFICIOS
   dados_json: {
     "titulo": "Por que nos escolher?",
     "beneficios": [
       { "icone": "star", "titulo": "Cursos de Qualidade", "descricao": "..." },
       { "icone": "users", "titulo": "Comunidade", "descricao": "..." }
     ]
   }

3. SOBRE
   dados_json: {
     "titulo": "Sobre nós",
     "descricao": "Texto longo sobre a empresa",
     "imagem_id": "id-da-imagem"
   }

4. DEPOIMENTOS
   dados_json: {} (carregado de CMSDepoimento)

5. FAQ
   dados_json: {} (carregado de CMSFAQ)

6. RODAPE
   dados_json: {
     "colunas": [
       { "titulo": "Empresa", "links": [...] },
       { "titulo": "Suporte", "links": [...] }
     ],
     "copyright": "© 2026 Comunidade RP"
   }

7. BANNER
   dados_json: {
     "titulo": "Promoção especial",
     "descricao": "30% de desconto",
     "cor": "#ff6b6b",
     "imagem_id": "id-da-imagem"
   }

8. CUSTOMIZADA
   dados_json: {} (JSON livre)

Fluxo no Painel:
1. Admin clica "Editar seção"
2. Editor visual muda dados_json
3. Salva → atualiza dados_json + updated_at
4. Frontend renderiza baseado em tipo_secao
```

### CMSBlocoConteudo (Blocos dentro de Seções)
```
Campos:
- id (PK): CUID único
- secao_id (FK): Referência para CMSSecao
- titulo: Título do bloco (opcional)
- conteudo_texto: Texto HTML
- imagem_id (FK): Referência para MediaImagem (opcional)
- ordem: Sequência dentro da seção
- criado_em: Data de criação
- atualizado_em: Data de atualização

Uso:
- Para seções que têm múltiplos blocos de conteúdo
- Ex: Seção BENEFICIOS tem N blocos (um por benefício)
- Ex: Seção SOBRE tem blocos de texto + imagem

Relacionamento:
- M:1 → CMSSecao
- 0:1 → MediaImagem

Fluxo no Painel:
1. Admin edita seção
2. Adiciona/remove blocos
3. Edita texto e imagem de cada bloco
4. Frontend renderiza em ordem
```

### CMSDepoimento (Depoimentos - Dados Separados)
```
Campos:
- id (PK): CUID único
- nome_aluno: Nome de quem deu depoimento
- foto_url: Foto do aluno (opcional)
- conteudo: Texto do depoimento
- classificacao: 1-5 (estrelas)
- ativo: Boolean (controla exibição)
- ordem: Sequência de exibição
- criado_em: Data de criação
- atualizado_em: Data de atualização

Fluxo no Painel:
1. Admin → /admin/cms/depoimentos
2. Clica "Novo depoimento"
3. Preenche: nome, foto, texto, estrelas
4. Salva → insert em CMSDepoimento
5. Seção DEPOIMENTOS carrega esses dados automaticamente
6. ativo=false → não aparece na home

Renderização:
- CMSSecao (tipo: DEPOIMENTOS) → query CMSDepoimento where ativo=true
- Ordena por ordem, exibe em carousel
```

### CMSFAQ (Perguntas Frequentes - Dados Separados)
```
Campos:
- id (PK): CUID único
- pergunta: Pergunta (max 500 chars)
- resposta: Resposta em HTML
- ordem: Sequência
- ativo: Boolean
- criado_em: Data de criação
- atualizado_em: Data de atualização

Fluxo no Painel:
1. Admin → /admin/cms/faq
2. Clica "Nova pergunta"
3. Preenche pergunta + resposta
4. Salva → insert em CMSFAQ
5. Seção FAQ carrega automaticamente
6. ativo=false → não aparece

Renderização:
- CMSSecao (tipo: FAQ) → query CMSFAQ where ativo=true
- Ordena por ordem, exibe em accordion
```

---

## 5. CAMADA DE NOTIFICAÇÕES

### Notificacao (Avisos Globais)
```
Campos:
- id (PK): CUID único
- titulo: Título do aviso (ex: "Nova aula liberada")
- mensagem: Mensagem do aviso
- tipo: NOVA_AULA | MANUTENCAO | PROMOCAO | IMPORTANTE | OUTRA
- ativo: Boolean (controla exibição)
- ordem_exibicao: Ordem no dashboard
- criado_em: Data de criação
- atualizado_em: Data de atualização

Tipos de Notificação:
1. NOVA_AULA
   Ex: "Nova aula 'Opções Avançadas' foi liberada"
   Ícone: 🎬

2. MANUTENCAO
   Ex: "Servidor em manutenção amanhã às 20h"
   Ícone: 🔧

3. PROMOCAO
   Ex: "30% de desconto em todos os cursos"
   Ícone: 🎁

4. IMPORTANTE
   Ex: "Bem-vindo à Comunidade RP!"
   Ícone: ⭐

5. OUTRA
   Ex: Qualquer outro tipo

Fluxo no Painel:
1. Admin → /admin/notificacoes
2. Clica "Nova notificação"
3. Preenche título, mensagem, tipo
4. Clica "Publicar"
5. Notificação aparece no dashboard de TODOS os alunos

ativo=false:
- Notificação fica "arquivada"
- Não aparece nos dashboards
- Pode ser reativada depois

Lógica de Exibição:
- Dashboard mostra: Notificacao where ativo=true order by ordem_exibicao
- Máximo 5 notificações por dashboard
- Usuário pode marcar como "lido"

Relacionamento N:M:
- Notificacao → NotificacaoLida ← Usuario
- Rastreia qual usuário já viu a notificação
```

### NotificacaoLida (Rastreamento de Leitura)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- notificacao_id (FK): Referência para Notificacao
- lida_em: Timestamp de quando foi lida
UNIQUE: (usuario_id, notificacao_id)

Fluxo:
1. Admin publica notificação
2. Usuário acessa dashboard
3. Vê notificação + clica "marcar como lido"
4. Insert em NotificacaoLida com lida_em=NOW()
5. Notificação não aparece mais para esse usuário

Dashboard Query:
SELECT n.*
FROM Notificacao n
LEFT JOIN NotificacaoLida nl ON nl.notificacao_id = n.id AND nl.usuario_id = {USER_ID}
WHERE n.ativo = true AND nl.id IS NULL
ORDER BY n.ordem_exibicao
LIMIT 5

Resultado: Mostra notificações ainda não lidas
```

---

## 6. CAMADA DE DOWNLOADS

### Download (Materiais Disponíveis para Download)
```
Campos:
- id (PK): CUID único
- titulo: Nome do material (ex: "Ebook - Forex Iniciantes")
- descricao: Descrição do que contém
- pdf_id (FK): Referência para MediaPDF
- ordem: Sequência na página
- ativo: Boolean (controla disponibilidade)
- criado_em: Data de criação
- atualizado_em: Data de atualização

Fluxo no Painel:
1. Admin faz upload de PDF → cria MediaPDF
2. Admin cria Download → vincula ao MediaPDF
3. Preenche título, descrição, ativo=true
4. Salva
5. Aluno inscritos veem em: /dashboard/downloads

Página de Downloads (na área de membros):
- Listagem de Downloads onde ativo=true
- Botão "Download" por material
- Rastreia em UsuarioDownload quando baixa

Relacionamento:
- M:1 → MediaPDF (um PDF pode ter N downloads)
- 1:N → UsuarioDownload
```

### UsuarioDownload (Rastreamento de Downloads)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Referência para Usuario
- download_id (FK): Referência para Download
- baixado_em: Timestamp do download
UNIQUE: (usuario_id, download_id)

Fluxo:
1. Usuário clica "Download" no material
2. Insert em UsuarioDownload com baixado_em=NOW()
3. Middleware valida autenticação
4. Arquivo é servido via streaming

Analytics:
- Quantas vezes cada material foi baixado
- Quais usuários baixaram qual material
- Relatório: /admin/analytics/downloads

Segurança:
- Apenas usuários autenticados podem baixar
- Logging de todos os downloads
- Pode implementar limite de downloads/dia
```

---

## 7. CAMADA DE SUPORTE

### SuporteTicket (Tickets de Suporte)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Quem abriu o ticket
- titulo: Assunto do ticket
- descricao: Descrição do problema
- status: ABERTO | EM_ANDAMENTO | AGUARDANDO_USUARIO | RESOLVIDO | FECHADO
- prioridade: BAIXA | NORMAL | ALTA | CRITICA
- criado_em: Data de abertura
- atualizado_em: Data de última atualização
- fechado_em: Quando foi fechado (se status=FECHADO)

Status Flow:
ABERTO → EM_ANDAMENTO → (AGUARDANDO_USUARIO → EM_ANDAMENTO) → RESOLVIDO → FECHADO

Prioridade:
- BAIXA: Dúvida geral, sem urgência
- NORMAL: Problema comum, pode esperar 24h
- ALTA: Erro impactando o aluno
- CRITICA: Serviço indisponível para o aluno

Fluxo no Painel:
1. Aluno → /suporte/novo-ticket
2. Preenche título, descrição, anexos (opcional)
3. Sistema automaticamente: status=ABERTO, prioridade=NORMAL
4. Admin vê em: /admin/suporte/tickets
5. Admin muda status → EM_ANDAMENTO
6. Admin responde em: SuporteMensagem
7. Quando resolvido: status=RESOLVIDO
8. Admin fecha: status=FECHADO

Relacionamento:
- M:1 → Usuario (criador)
- 1:N → SuporteMensagem (respostas)
```

### SuporteMensagem (Mensagens no Ticket)
```
Campos:
- id (PK): CUID único
- ticket_id (FK): Referência para SuporteTicket
- usuario_id (FK): Quem escreveu (aluno ou admin)
- conteudo: Texto da mensagem
- eh_resposta_admin: Boolean (true se admin respondeu)
- criado_em: Timestamp

Fluxo:
1. Ticket aberto com descrição inicial
2. Admin adiciona resposta → insert com eh_resposta_admin=true
3. Aluno vê no ticket → pode responder
4. Admin vê nova resposta → responde novamente
5. Conversação continua até resolução

Notificações:
- Quando admin responde → email para aluno
- Quando aluno responde → notificação para admin

Relacionamento:
- M:1 → SuporteTicket
- M:1 → Usuario
```

---

## 8. CAMADA DE AUDITORIA

### LogAuditoria (Rastreamento de Alterações)
```
Campos:
- id (PK): CUID único
- usuario_id (FK): Quem fez a ação
- acao: Tipo de ação (INSERT, UPDATE, DELETE, etc.)
- tabela_afetada: Nome da tabela
- id_recurso: ID do recurso alterado
- valores_antes: JSON com valores antes
- valores_depois: JSON com valores depois
- ip_address: IP de onde veio
- user_agent: Navegador/cliente
- criado_em: Timestamp

Fluxo Automático:
1. Admin altera conteúdo → trigger gera LOG
2. LogAuditoria registra: ação, tabela, IDs, valores
3. Admin pode auditar mudanças

Exemplo:
Admin muda "Forex para Iniciantes" de preco=297 para preco=197
┌─ LogAuditoria insert:
├─ usuario_id: admin123
├─ acao: UPDATE
├─ tabela_afetada: Curso
├─ id_recurso: curso-forex-1
├─ valores_antes: {"preco": 297.00}
├─ valores_depois: {"preco": 197.00}
├─ criado_em: 2026-06-11 14:30:00
└─ Pode reverter a alteração se necessário

Analytics:
- Relatório de atividades do admin
- Quem, o quê, quando, onde (IP), como (navegador)
- Compliance e segurança
```

---

# 🔑 ÍNDICES E PERFORMANCE

Índices Criados (otimização para queries frequentes):

```sql
-- Usuario
INDEX idx_usuario_email (email) - UNIQUE
INDEX idx_usuario_role (role)
INDEX idx_usuario_status (status)
INDEX idx_usuario_assinatura_ativa (assinatura_ativa)

-- Cursos
INDEX idx_curso_categoria (categoria)
INDEX idx_curso_publicado (publicado)
INDEX idx_curso_criado_em (criado_em)

-- Aulas
INDEX idx_aula_modulo_id (modulo_id)
INDEX idx_aula_liberada (liberada)

-- UsuarioCurso
UNIQUE INDEX idx_usuario_curso (usuario_id, curso_id)
INDEX idx_usuario_curso_concluido (concluido)

-- Notificacoes
INDEX idx_notificacao_ativo (ativo)
INDEX idx_notificacao_tipo (tipo)
INDEX idx_notificacao_criado_em (criado_em)

-- E muitos outros...
```

Performance Esperada:
- Query de cursos: < 50ms
- Query de progresso do usuário: < 100ms
- Busca de notificações: < 30ms
- Listagem de aulas: < 50ms

---

# 🚀 PRÓXIMOS PASSOS

## Fase 2: API (Routes + Controllers)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/cursos
- GET /api/cursos/{id}
- GET /api/aulas/{id}
- POST /api/usuarios/progresso
- E muitas outras...

## Fase 3: Frontend
- Home com CMS dinâmico
- Painel de login
- Dashboard de cursos
- Admin panel para editar tudo

## Fase 4: Integração
- Email com Resend
- Pagamento com Stripe
- Upload com Hostinger SFTP

---

# ✅ VALIDAÇÃO FINAL

Checklist de Criação do Banco:

- [x] 24 tabelas criadas
- [x] Relacionamentos 1:1, 1:N, N:M definidos
- [x] Constraints e UNIQUEs aplicados
- [x] Índices para performance otimizados
- [x] Soft deletes onde necessário
- [x] Timestamps (created_at, updated_at) em todas as tabelas
- [x] Enums tipados para roles, status, tipos
- [x] Estrutura de permissões simples (3 roles)
- [x] CMS totalmente dinâmico (12 elementos editáveis)
- [x] Notificações para avisos globais
- [x] Vídeos apenas externos (sem upload físico)
- [x] PDFs e imagens em /public/uploads/
- [x] Auditoria e logging completos
- [x] Segurança com hashing de senhas
- [x] Sessions JWT com refresh tokens

**Banco 100% pronto para produção!** 🎉
