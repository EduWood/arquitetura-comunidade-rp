-- CreateEnum: Role
CREATE TYPE `Role` AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MEMBRO');

-- CreateEnum: StatusUsuario
CREATE TYPE `StatusUsuario` AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO', 'AGUARDANDO_VERIFICACAO');

-- CreateEnum: CategoriaCurso
CREATE TYPE `CategoriaCurso` AS ENUM ('FOREX', 'CRIPTOMOEDAS', 'BOLSA', 'OPCOES', 'INVESTIMENTOS', 'EDUCACAO_FINANCEIRA', 'OUTRO');

-- CreateEnum: NivelCurso
CREATE TYPE `NivelCurso` AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');

-- CreateEnum: TipoConteudo
CREATE TYPE `TipoConteudo` AS ENUM ('VIDEO', 'PDF', 'TEXTO', 'MISTO');

-- CreateEnum: TipoVideo
CREATE TYPE `TipoVideo` AS ENUM ('YOUTUBE', 'VIMEO', 'BUNNY', 'EXTERNO');

-- CreateEnum: TipoConfiguracao
CREATE TYPE `TipoConfiguracao` AS ENUM ('STRING', 'NUMERO', 'BOOLEANO', 'JSON');

-- CreateEnum: TipoSecao
CREATE TYPE `TipoSecao` AS ENUM ('HERO', 'BENEFICIOS', 'SOBRE', 'DEPOIMENTOS', 'FAQ', 'RODAPE', 'BANNER', 'CUSTOMIZADA');

-- CreateEnum: TipoNotificacao
CREATE TYPE `TipoNotificacao` AS ENUM ('NOVA_AULA', 'MANUTENCAO', 'PROMOCAO', 'IMPORTANTE', 'OUTRA');

-- CreateEnum: StatusTicket
CREATE TYPE `StatusTicket` AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'FECHADO');

-- CreateEnum: Prioridade
CREATE TYPE `Prioridade` AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'CRITICA');

-- CreateTable: Usuario
CREATE TABLE `Usuario` (
  `id` VARCHAR(191) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha_hash` VARCHAR(500) NOT NULL,
  `telefone` VARCHAR(20),
  `avatar_url` VARCHAR(500),
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBRO') NOT NULL DEFAULT 'MEMBRO',
  `status` ENUM('ATIVO', 'INATIVO', 'BLOQUEADO', 'AGUARDANDO_VERIFICACAO') NOT NULL DEFAULT 'ATIVO',
  `assinatura_ativa` BOOLEAN NOT NULL DEFAULT false,
  `data_inicio_assinatura` DATETIME(3),
  `data_fim_assinatura` DATETIME(3),
  `ultima_login` DATETIME(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `Usuario_email_key` (`email`),
  INDEX `Usuario_email_idx` (`email`),
  INDEX `Usuario_role_idx` (`role`),
  INDEX `Usuario_status_idx` (`status`),
  INDEX `Usuario_assinatura_ativa_idx` (`assinatura_ativa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: SessaoJWT
CREATE TABLE `SessaoJWT` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(1000) NOT NULL,
  `refresh_token` VARCHAR(1000) NOT NULL,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `expires_at` DATETIME(3) NOT NULL,
  `revogado` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `SessaoJWT_token_key` (`token`),
  UNIQUE KEY `SessaoJWT_refresh_token_key` (`refresh_token`),
  INDEX `SessaoJWT_usuario_id_idx` (`usuario_id`),
  INDEX `SessaoJWT_expires_at_idx` (`expires_at`),
  INDEX `SessaoJWT_revogado_idx` (`revogado`),
  CONSTRAINT `SessaoJWT_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: TokenRecuperacao
CREATE TABLE `TokenRecuperacao` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `usado` BOOLEAN NOT NULL DEFAULT false,
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `TokenRecuperacao_token_key` (`token`),
  INDEX `TokenRecuperacao_usuario_id_idx` (`usuario_id`),
  INDEX `TokenRecuperacao_usado_idx` (`usado`),
  INDEX `TokenRecuperacao_expires_at_idx` (`expires_at`),
  CONSTRAINT `TokenRecuperacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: Curso
CREATE TABLE `Curso` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT NOT NULL,
  `descricao_curta` VARCHAR(500) NOT NULL,
  `imagem_url` VARCHAR(500),
  `preco` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `preco_promocional` DECIMAL(10,2),
  `categoria` ENUM('FOREX', 'CRIPTOMOEDAS', 'BOLSA', 'OPCOES', 'INVESTIMENTOS', 'EDUCACAO_FINANCEIRA', 'OUTRO') NOT NULL,
  `nivel` ENUM('INICIANTE', 'INTERMEDIARIO', 'AVANCADO') NOT NULL DEFAULT 'INICIANTE',
  `duracao_horas` INT,
  `ordem` INT NOT NULL DEFAULT 0,
  `publicado` BOOLEAN NOT NULL DEFAULT false,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Curso_categoria_idx` (`categoria`),
  INDEX `Curso_publicado_idx` (`publicado`),
  INDEX `Curso_criado_em_idx` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: Modulo
CREATE TABLE `Modulo` (
  `id` VARCHAR(191) NOT NULL,
  `curso_id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT,
  `ordem` INT NOT NULL DEFAULT 0,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Modulo_curso_id_idx` (`curso_id`),
  INDEX `Modulo_ordem_idx` (`ordem`),
  CONSTRAINT `Modulo_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `Curso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: Aula
CREATE TABLE `Aula` (
  `id` VARCHAR(191) NOT NULL,
  `modulo_id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT,
  `ordem` INT NOT NULL DEFAULT 0,
  `duracao_minutos` INT,
  `liberada` BOOLEAN NOT NULL DEFAULT false,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Aula_modulo_id_idx` (`modulo_id`),
  INDEX `Aula_ordem_idx` (`ordem`),
  INDEX `Aula_liberada_idx` (`liberada`),
  CONSTRAINT `Aula_modulo_id_fkey` FOREIGN KEY (`modulo_id`) REFERENCES `Modulo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: AulaConteudo
CREATE TABLE `AulaConteudo` (
  `id` VARCHAR(191) NOT NULL,
  `aula_id` VARCHAR(191) NOT NULL,
  `tipo_conteudo` ENUM('VIDEO', 'PDF', 'TEXTO', 'MISTO') NOT NULL,
  `video_id` VARCHAR(191),
  `pdf_id` VARCHAR(191),
  `texto_html` LONGTEXT,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `AulaConteudo_aula_id_key` (`aula_id`),
  INDEX `AulaConteudo_aula_id_idx` (`aula_id`),
  INDEX `AulaConteudo_tipo_conteudo_idx` (`tipo_conteudo`),
  CONSTRAINT `AulaConteudo_aula_id_fkey` FOREIGN KEY (`aula_id`) REFERENCES `Aula` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AulaConteudo_video_id_fkey` FOREIGN KEY (`video_id`) REFERENCES `MediaVideo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `AulaConteudo_pdf_id_fkey` FOREIGN KEY (`pdf_id`) REFERENCES `MediaPDF` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: UsuarioCurso
CREATE TABLE `UsuarioCurso` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `curso_id` VARCHAR(191) NOT NULL,
  `progresso_pct` INT NOT NULL DEFAULT 0,
  `concluido` BOOLEAN NOT NULL DEFAULT false,
  `data_inscricao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `data_conclusao` DATETIME(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `UsuarioCurso_usuario_id_curso_id_key` (`usuario_id`, `curso_id`),
  INDEX `UsuarioCurso_usuario_id_idx` (`usuario_id`),
  INDEX `UsuarioCurso_curso_id_idx` (`curso_id`),
  INDEX `UsuarioCurso_concluido_idx` (`concluido`),
  CONSTRAINT `UsuarioCurso_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsuarioCurso_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `Curso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: UsuarioAula
CREATE TABLE `UsuarioAula` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `aula_id` VARCHAR(191) NOT NULL,
  `assistida` BOOLEAN NOT NULL DEFAULT false,
  `tempo_asistido` INT,
  `data_conclusao` DATETIME(3),
  `atualizado_em` DATETIME(3) NOT NULL,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `UsuarioAula_usuario_id_aula_id_key` (`usuario_id`, `aula_id`),
  INDEX `UsuarioAula_usuario_id_idx` (`usuario_id`),
  INDEX `UsuarioAula_aula_id_idx` (`aula_id`),
  INDEX `UsuarioAula_assistida_idx` (`assistida`),
  CONSTRAINT `UsuarioAula_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsuarioAula_aula_id_fkey` FOREIGN KEY (`aula_id`) REFERENCES `Aula` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: MediaImagem
CREATE TABLE `MediaImagem` (
  `id` VARCHAR(191) NOT NULL,
  `nome_original` VARCHAR(255) NOT NULL,
  `nome_arquivo` VARCHAR(255) NOT NULL,
  `caminho_relativo` VARCHAR(500) NOT NULL,
  `url_publica` VARCHAR(500) NOT NULL,
  `tamanho_bytes` INT NOT NULL,
  `tipo_mime` VARCHAR(100) NOT NULL,
  `largura` INT,
  `altura` INT,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `MediaImagem_nome_arquivo_key` (`nome_arquivo`),
  INDEX `MediaImagem_criado_em_idx` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: MediaPDF
CREATE TABLE `MediaPDF` (
  `id` VARCHAR(191) NOT NULL,
  `nome_original` VARCHAR(255) NOT NULL,
  `nome_arquivo` VARCHAR(255) NOT NULL,
  `caminho_relativo` VARCHAR(500) NOT NULL,
  `url_publica` VARCHAR(500) NOT NULL,
  `tamanho_bytes` INT NOT NULL,
  `paginas` INT,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `MediaPDF_nome_arquivo_key` (`nome_arquivo`),
  INDEX `MediaPDF_criado_em_idx` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: MediaVideo
CREATE TABLE `MediaVideo` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT,
  `tipo_video` ENUM('YOUTUBE', 'VIMEO', 'BUNNY', 'EXTERNO') NOT NULL,
  `video_url` VARCHAR(500) NOT NULL,
  `video_id` VARCHAR(255),
  `thumbnail_url` VARCHAR(500),
  `duracao_segundos` INT,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `MediaVideo_tipo_video_idx` (`tipo_video`),
  INDEX `MediaVideo_criado_em_idx` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: Download
CREATE TABLE `Download` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT,
  `pdf_id` VARCHAR(191) NOT NULL,
  `ordem` INT NOT NULL DEFAULT 0,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Download_pdf_id_idx` (`pdf_id`),
  INDEX `Download_ativo_idx` (`ativo`),
  CONSTRAINT `Download_pdf_id_fkey` FOREIGN KEY (`pdf_id`) REFERENCES `MediaPDF` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: UsuarioDownload
CREATE TABLE `UsuarioDownload` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `download_id` VARCHAR(191) NOT NULL,
  `baixado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `UsuarioDownload_usuario_id_download_id_key` (`usuario_id`, `download_id`),
  INDEX `UsuarioDownload_usuario_id_idx` (`usuario_id`),
  INDEX `UsuarioDownload_download_id_idx` (`download_id`),
  CONSTRAINT `UsuarioDownload_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UsuarioDownload_download_id_fkey` FOREIGN KEY (`download_id`) REFERENCES `Download` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSConfiguracao
CREATE TABLE `CMSConfiguracao` (
  `id` VARCHAR(191) NOT NULL,
  `chave` VARCHAR(100) NOT NULL,
  `valor` LONGTEXT NOT NULL,
  `tipo` ENUM('STRING', 'NUMERO', 'BOOLEANO', 'JSON') NOT NULL,
  `descricao` VARCHAR(500),
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `CMSConfiguracao_chave_key` (`chave`),
  INDEX `CMSConfiguracao_chave_idx` (`chave`),
  INDEX `CMSConfiguracao_tipo_idx` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSPagina
CREATE TABLE `CMSPagina` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT,
  `conteudo_html` LONGTEXT,
  `seo_titulo` VARCHAR(255),
  `seo_descricao` VARCHAR(500),
  `seo_keywords` VARCHAR(500),
  `publicada` BOOLEAN NOT NULL DEFAULT false,
  `ordem` INT NOT NULL DEFAULT 0,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `CMSPagina_slug_key` (`slug`),
  INDEX `CMSPagina_slug_idx` (`slug`),
  INDEX `CMSPagina_publicada_idx` (`publicada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSSecao
CREATE TABLE `CMSSecao` (
  `id` VARCHAR(191) NOT NULL,
  `pagina_id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `tipo_secao` ENUM('HERO', 'BENEFICIOS', 'SOBRE', 'DEPOIMENTOS', 'FAQ', 'RODAPE', 'BANNER', 'CUSTOMIZADA') NOT NULL,
  `ordem` INT NOT NULL DEFAULT 0,
  `dados_json` LONGTEXT NOT NULL,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `CMSSecao_pagina_id_idx` (`pagina_id`),
  INDEX `CMSSecao_tipo_secao_idx` (`tipo_secao`),
  INDEX `CMSSecao_ordem_idx` (`ordem`),
  CONSTRAINT `CMSSecao_pagina_id_fkey` FOREIGN KEY (`pagina_id`) REFERENCES `CMSPagina` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSBlocoConteudo
CREATE TABLE `CMSBlocoConteudo` (
  `id` VARCHAR(191) NOT NULL,
  `secao_id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255),
  `conteudo_texto` LONGTEXT,
  `imagem_id` VARCHAR(191),
  `ordem` INT NOT NULL DEFAULT 0,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `CMSBlocoConteudo_secao_id_idx` (`secao_id`),
  INDEX `CMSBlocoConteudo_ordem_idx` (`ordem`),
  CONSTRAINT `CMSBlocoConteudo_secao_id_fkey` FOREIGN KEY (`secao_id`) REFERENCES `CMSSecao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CMSBlocoConteudo_imagem_id_fkey` FOREIGN KEY (`imagem_id`) REFERENCES `MediaImagem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSDepoimento
CREATE TABLE `CMSDepoimento` (
  `id` VARCHAR(191) NOT NULL,
  `nome_aluno` VARCHAR(255) NOT NULL,
  `foto_url` VARCHAR(500),
  `conteudo` LONGTEXT NOT NULL,
  `classificacao` INT NOT NULL DEFAULT 5,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `ordem` INT NOT NULL DEFAULT 0,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `CMSDepoimento_ativo_idx` (`ativo`),
  INDEX `CMSDepoimento_ordem_idx` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: CMSFAQ
CREATE TABLE `CMSFAQ` (
  `id` VARCHAR(191) NOT NULL,
  `pergunta` VARCHAR(500) NOT NULL,
  `resposta` LONGTEXT NOT NULL,
  `ordem` INT NOT NULL DEFAULT 0,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `CMSFAQ_ativo_idx` (`ativo`),
  INDEX `CMSFAQ_ordem_idx` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: Notificacao
CREATE TABLE `Notificacao` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `mensagem` LONGTEXT NOT NULL,
  `tipo` ENUM('NOVA_AULA', 'MANUTENCAO', 'PROMOCAO', 'IMPORTANTE', 'OUTRA') NOT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT true,
  `ordem_exibicao` INT NOT NULL DEFAULT 0,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Notificacao_ativo_idx` (`ativo`),
  INDEX `Notificacao_tipo_idx` (`tipo`),
  INDEX `Notificacao_criado_em_idx` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: NotificacaoLida
CREATE TABLE `NotificacaoLida` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `notificacao_id` VARCHAR(191) NOT NULL,
  `lida_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `NotificacaoLida_usuario_id_notificacao_id_key` (`usuario_id`, `notificacao_id`),
  INDEX `NotificacaoLida_usuario_id_idx` (`usuario_id`),
  INDEX `NotificacaoLida_notificacao_id_idx` (`notificacao_id`),
  CONSTRAINT `NotificacaoLida_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `NotificacaoLida_notificacao_id_fkey` FOREIGN KEY (`notificacao_id`) REFERENCES `Notificacao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: SuporteTicket
CREATE TABLE `SuporteTicket` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` LONGTEXT NOT NULL,
  `status` ENUM('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'FECHADO') NOT NULL DEFAULT 'ABERTO',
  `prioridade` ENUM('BAIXA', 'NORMAL', 'ALTA', 'CRITICA') NOT NULL DEFAULT 'NORMAL',
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,
  `fechado_em` DATETIME(3),

  PRIMARY KEY (`id`),
  INDEX `SuporteTicket_usuario_id_idx` (`usuario_id`),
  INDEX `SuporteTicket_status_idx` (`status`),
  INDEX `SuporteTicket_prioridade_idx` (`prioridade`),
  CONSTRAINT `SuporteTicket_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: SuporteMensagem
CREATE TABLE `SuporteMensagem` (
  `id` VARCHAR(191) NOT NULL,
  `ticket_id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191) NOT NULL,
  `conteudo` LONGTEXT NOT NULL,
  `eh_resposta_admin` BOOLEAN NOT NULL DEFAULT false,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `SuporteMensagem_ticket_id_idx` (`ticket_id`),
  INDEX `SuporteMensagem_usuario_id_idx` (`usuario_id`),
  CONSTRAINT `SuporteMensagem_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `SuporteTicket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SuporteMensagem_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable: LogAuditoria
CREATE TABLE `LogAuditoria` (
  `id` VARCHAR(191) NOT NULL,
  `usuario_id` VARCHAR(191),
  `acao` VARCHAR(255) NOT NULL,
  `tabela_afetada` VARCHAR(100) NOT NULL,
  `id_recurso` VARCHAR(100),
  `valores_antes` LONGTEXT,
  `valores_depois` LONGTEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `LogAuditoria_usuario_id_idx` (`usuario_id`),
  INDEX `LogAuditoria_tabela_afetada_idx` (`tabela_afetada`),
  INDEX `LogAuditoria_criado_em_idx` (`criado_em`),
  CONSTRAINT `LogAuditoria_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
