// Tipos globais da aplicação

// ============ AUTH ============
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  role: 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'CMS';
  status: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
  criado_em: Date;
}

export interface SessaoJWT {
  usuarioId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ============ CURSO ============
export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';
  publicado: boolean;
  capa_url?: string;
  preco: number;
  alunos_total: number;
  rating: number;
  criado_em: Date;
}

export interface Modulo {
  id: string;
  cursoId: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  criado_em: Date;
}

export interface Aula {
  id: string;
  moduloId: string;
  titulo: string;
  descricao?: string;
  conteudo: string;
  tipo: 'VIDEO' | 'TEXTO' | 'QUIZ';
  duracao_minutos?: number;
  ordem: number;
  criado_em: Date;
}

// ============ MATRÍCULA E PROGRESSO ============
export interface UsuarioCurso {
  id: string;
  usuarioId: string;
  cursoId: string;
  progresso_pct: number;
  concluido: boolean;
  data_inscricao: Date;
  atualizado_em: Date;
}

export interface UsuarioAula {
  id: string;
  usuarioId: string;
  aulaId: string;
  concluido: boolean;
  tempo_assistido: number;
  progresso_pct: number;
  criado_em: Date;
}

// ============ MATERIAIS ============
export interface Material {
  id: string;
  aulaId: string;
  nome: string;
  tipo: 'PDF' | 'IMAGEM' | 'ARQUIVO';
  url: string;
  tamanho_mb: number;
  criado_em: Date;
}

// ============ CERTIFICADO ============
export interface Certificado {
  id: string;
  usuarioId: string;
  cursoId: string;
  numero_serie: string;
  data_emissao: Date;
  url_pdf?: string;
}

// ============ REQUISIÇÕES/RESPOSTAS ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmar_senha: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}
