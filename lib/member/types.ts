// Member DTOs e Validators com Zod

import { z } from 'zod';

// ============= PROGRESS DTOs =============

export const ProgressStatusSchema = z.enum(['NAO_INICIADO', 'EM_PROGRESSO', 'CONCLUIDO']);

export const MarkLessonCompleteSchema = z.object({
  aula_id: z.string().min(1, 'ID da aula obrigatório'),
  tempo_assistido_segundos: z.number().int().nonnegative().optional(),
});

export type MarkLessonCompleteDTO = z.infer<typeof MarkLessonCompleteSchema>;

export const UpdateProgressSchema = z.object({
  progresso_pct: z
    .number()
    .min(0)
    .max(100, 'Progresso deve estar entre 0 e 100'),
  tempo_assistido_segundos: z.number().int().nonnegative().optional(),
});

export type UpdateProgressDTO = z.infer<typeof UpdateProgressSchema>;

// ============= CERTIFICATE DTOs =============

export const GenerateCertificateSchema = z.object({
  curso_id: z.string().min(1, 'ID do curso obrigatório'),
});

export type GenerateCertificateDTO = z.infer<typeof GenerateCertificateSchema>;

export const VerifyCertificateSchema = z.object({
  numero_certificado: z.string().min(1, 'Número do certificado obrigatório'),
});

export type VerifyCertificateDTO = z.infer<typeof VerifyCertificateSchema>;

// ============= MATERIAL DTOs =============

export const MaterialTypeSchema = z.enum(['PDF', 'ZIP', 'DOCX', 'XLSX', 'TXT', 'OTHER']);

export const CreateMaterialSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(255),
  descricao: z.string().max(1000).optional(),
  tipo: MaterialTypeSchema,
  arquivo_url: z.string().url('URL inválida'),
  tamanho_bytes: z.number().int().positive(),
  aula_id: z.string().optional(),
  curso_id: z.string().optional(),
});

export type CreateMaterialDTO = z.infer<typeof CreateMaterialSchema>;

export const UpdateMaterialSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  descricao: z.string().max(1000).optional(),
  arquivo_url: z.string().url().optional(),
});

export type UpdateMaterialDTO = z.infer<typeof UpdateMaterialSchema>;

// ============= CONTINUE WATCHING DTOs =============

export const SavePositionSchema = z.object({
  aula_id: z.string().min(1, 'ID da aula obrigatório'),
  timestamp_segundos: z.number().int().nonnegative(),
  progresso_percentual: z.number().min(0).max(100),
});

export type SavePositionDTO = z.infer<typeof SavePositionSchema>;

// ============= VIDEO DTOs =============

export const VideoProviderSchema = z.enum(['YOUTUBE', 'VIMEO', 'BUNNY', 'UNKNOWN']);

export const VideoUrlSchema = z.object({
  url: z.string().url('URL inválida'),
});

export type VideoUrlDTO = z.infer<typeof VideoUrlSchema>;

// ============= COURSE ACCESS DTOs =============

export const CourseAccessSchema = z.object({
  usuario_id: z.string().min(1, 'ID do usuário obrigatório'),
  curso_id: z.string().min(1, 'ID do curso obrigatório'),
});

export type CourseAccessDTO = z.infer<typeof CourseAccessSchema>;

// ============= VALIDATION HELPERS =============

export class ValidatorHelper {
  /**
   * Validar e fazer parse de DTO com Zod
   */
  static validate<T>(schema: z.ZodSchema, data: unknown): { valid: boolean; data?: T; error?: string } {
    try {
      const resultado = schema.parse(data);
      return { valid: true, data: resultado as T };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
        return { valid: false, error: messages.join('; ') };
      }
      return { valid: false, error: 'Erro ao validar dados' };
    }
  }

  /**
   * Validar múltiplos DTOs
   */
  static validateMultiple(validations: Array<{ schema: z.ZodSchema; data: unknown }>) {
    const erros: string[] = [];

    for (const { schema, data } of validations) {
      const resultado = this.validate(schema, data);
      if (!resultado.valid) {
        erros.push(resultado.error!);
      }
    }

    return {
      valido: erros.length === 0,
      erros: erros.length > 0 ? erros : undefined,
    };
  }
}
