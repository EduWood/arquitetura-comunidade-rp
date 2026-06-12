// Course Domain Types and DTOs

import { z } from 'zod';

// ============== CURSO ==============

export const CreateCursoSchema = z.object({
  titulo: z.string().min(3).max(255),
  descricao: z.string().min(10).max(2000),
  imagem_url: z.string().url().optional(),
  instrutor_id: z.string().uuid(),
  categoria: z.enum(['DESENVOLVIMENTO', 'DESIGN', 'NEGOCIOS', 'PESSOAL', 'OUTRO']),
  nivel: z.enum(['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']),
  preco: z.number().min(0).optional(),
  ativo: z.boolean().default(true),
});

export const UpdateCursoSchema = CreateCursoSchema.partial();

export type CreateCursoDTO = z.infer<typeof CreateCursoSchema>;
export type UpdateCursoDTO = z.infer<typeof UpdateCursoSchema>;

// ============== MODULO ==============

export const CreateModuloSchema = z.object({
  curso_id: z.string().uuid(),
  titulo: z.string().min(3).max(255),
  descricao: z.string().max(1000).optional(),
  ordem: z.number().int().min(0),
  ativo: z.boolean().default(true),
});

export const UpdateModuloSchema = CreateModuloSchema.partial();

export type CreateModuloDTO = z.infer<typeof CreateModuloSchema>;
export type UpdateModuloDTO = z.infer<typeof UpdateModuloSchema>;

// ============== AULA ==============

export const CreateAulaSchema = z.object({
  modulo_id: z.string().uuid(),
  titulo: z.string().min(3).max(255),
  descricao: z.string().max(2000).optional(),
  ordem: z.number().int().min(0),
  tipo_conteudo: z.enum(['VIDEO', 'TEXTO', 'QUIZ', 'TAREFA']),
  tempo_estimado_minutos: z.number().int().min(1).optional(),
  ativo: z.boolean().default(true),
});

export const UpdateAulaSchema = CreateAulaSchema.partial();

export type CreateAulaDTO = z.infer<typeof CreateAulaSchema>;
export type UpdateAulaDTO = z.infer<typeof UpdateAulaSchema>;

// ============== VIDEO ==============

export const CreateVideoSchema = z.object({
  aula_id: z.string().uuid(),
  titulo: z.string().min(3).max(255),
  url_original: z.string().url(),
  provedor: z.enum(['YOUTUBE', 'VIMEO', 'BUNNY']),
  video_id: z.string(),
  thumbnail_url: z.string().url().optional(),
  duracao_segundos: z.number().int().min(1).optional(),
  ativo: z.boolean().default(true),
});

export const UpdateVideoSchema = CreateVideoSchema.partial();

export type CreateVideoDTO = z.infer<typeof CreateVideoSchema>;
export type UpdateVideoDTO = z.infer<typeof UpdateVideoSchema>;

// ============== MATERIAL ==============

export const CreateMaterialSchema = z.object({
  aula_id: z.string().uuid(),
  titulo: z.string().min(3).max(255),
  tipo: z.enum(['PDF', 'DOC', 'IMAGEM', 'RECURSO']),
  arquivo_url: z.string().url(),
  descricao: z.string().max(1000).optional(),
  ordem: z.number().int().min(0),
  ativo: z.boolean().default(true),
});

export const UpdateMaterialSchema = CreateMaterialSchema.partial();

export type CreateMaterialDTO = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialDTO = z.infer<typeof UpdateMaterialSchema>;

// ============== PROGRESSO ==============

export const CreateProgressoSchema = z.object({
  usuario_id: z.string().uuid(),
  curso_id: z.string().uuid(),
  aula_id: z.string().uuid().optional(),
  status: z.enum(['NAO_INICIADO', 'EM_PROGRESSO', 'CONCLUIDO']),
  porcentagem_conclusao: z.number().min(0).max(100),
  tempo_assistido_segundos: z.number().int().min(0).optional(),
});

export const UpdateProgressoSchema = CreateProgressoSchema.partial();

export type CreateProgressoDTO = z.infer<typeof CreateProgressoSchema>;
export type UpdateProgressoDTO = z.infer<typeof UpdateProgressoSchema>;

// ============== ACESSO ==============

export const CreateAcessoSchema = z.object({
  usuario_id: z.string().uuid(),
  curso_id: z.string().uuid(),
  tipo_acesso: z.enum(['COMPRADO', 'CUPOM', 'CORTESIA', 'ASSINANTE']),
  data_inicio: z.date().optional(),
  data_expiracao: z.date().optional(),
  ativo: z.boolean().default(true),
});

export const UpdateAcessoSchema = CreateAcessoSchema.partial();

export type CreateAcessoDTO = z.infer<typeof CreateAcessoSchema>;
export type UpdateAcessoDTO = z.infer<typeof UpdateAcessoSchema>;

// ============== RESPOSTAS ==============

export interface CursoResponse {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel: string;
  modulos_count: number;
  alunos_count: number;
}

export interface ModuloResponse {
  id: string;
  titulo: string;
  aulas_count: number;
}

export interface AulaResponse {
  id: string;
  titulo: string;
  tipo_conteudo: string;
  tempo_estimado_minutos?: number;
}

export interface ProgressoResponse {
  usuario_id: string;
  curso_id: string;
  porcentagem_conclusao: number;
  status: string;
  aulas_concluidas: number;
  total_aulas: number;
}
