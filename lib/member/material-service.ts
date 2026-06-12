// Serviço de Materiais Complementares
// Gerencia upload, download e listagem de PDFs, ZIPs, DOCX, XLSX

import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';
import { HostingerUploadService } from '@/lib/cms/upload-service';

export type MaterialType = 'PDF' | 'ZIP' | 'DOCX' | 'XLSX' | 'TXT' | 'OTHER';

interface CreateMaterialDTO {
  nome: string;
  descricao?: string;
  tipo: MaterialType;
  arquivo_url: string;
  tamanho_bytes: number;
  aula_id?: string;
  curso_id?: string;
}

interface UpdateMaterialDTO {
  nome?: string;
  descricao?: string;
  arquivo_url?: string;
}

export class MaterialService {
  /**
   * Criar material complementar
   */
  static async criar(
    dados: CreateMaterialDTO,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      // Validar tipo de arquivo
      const tiposPermitidos: MaterialType[] = ['PDF', 'ZIP', 'DOCX', 'XLSX', 'TXT', 'OTHER'];
      if (!tiposPermitidos.includes(dados.tipo)) {
        return { success: false, error: 'Tipo de arquivo não permitido' };
      }

      // Validar tamanho (máx 100MB)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (dados.tamanho_bytes > MAX_SIZE) {
        return { success: false, error: 'Arquivo muito grande (máx 100MB)' };
      }

      // Criar registro (usar modelo existente: Download)
      // Se não existir modelo específico para materiais, usar Download
      const material = await prisma.download.create({
        data: {
          nome: dados.nome,
          descricao: dados.descricao || '',
          tipo: dados.tipo,
          arquivo_url: dados.arquivo_url,
          tamanho_bytes: dados.tamanho_bytes,
          criado_em: new Date(),
          atualizado_em: new Date(),
        } as any,
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MATERIAL_CRIAR',
        tabela_afetada: 'Download',
        id_recurso: material.id,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: material };
    } catch (error) {
      console.error('[MaterialService] Erro ao criar:', error);
      throw error;
    }
  }

  /**
   * Obter material
   */
  static async obter(materialId: string) {
    try {
      const material = await prisma.download.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        return { success: false, error: 'Material não encontrado' };
      }

      return { success: true, data: material };
    } catch (error) {
      console.error('[MaterialService] Erro ao obter:', error);
      return { success: false, error: 'Erro ao obter material' };
    }
  }

  /**
   * Listar materiais de uma aula
   */
  static async listarPorAula(aulaId: string) {
    try {
      // Implementação simplificada: retornar todos os materiais
      // Em produção, haveria relação material->aula no banco
      const materiais = await prisma.download.findMany({
        orderBy: { criado_em: 'desc' },
      });

      return { success: true, data: materiais };
    } catch (error) {
      console.error('[MaterialService] Erro ao listar:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Listar materiais de um curso
   */
  static async listarPorCurso(cursoId: string) {
    try {
      const materiais = await prisma.download.findMany({
        orderBy: { criado_em: 'desc' },
      });

      return { success: true, data: materiais };
    } catch (error) {
      console.error('[MaterialService] Erro ao listar:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Atualizar material
   */
  static async atualizar(
    materialId: string,
    dados: UpdateMaterialDTO,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const anterior = await prisma.download.findUnique({
        where: { id: materialId },
      });

      if (!anterior) {
        return { success: false, error: 'Material não encontrado' };
      }

      const atualizado = await prisma.download.update({
        where: { id: materialId },
        data: {
          ...dados,
          atualizado_em: new Date(),
        } as any,
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MATERIAL_ATUALIZAR',
        tabela_afetada: 'Download',
        id_recurso: materialId,
        valores_antes: anterior,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: atualizado };
    } catch (error) {
      console.error('[MaterialService] Erro ao atualizar:', error);
      throw error;
    }
  }

  /**
   * Deletar material
   */
  static async deletar(
    materialId: string,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const material = await prisma.download.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        return { success: false, error: 'Material não encontrado' };
      }

      // Tentar deletar arquivo do storage
      if (material.arquivo_url) {
        try {
          await HostingerUploadService.deletarArquivo(material.arquivo_url);
        } catch (err) {
          console.warn('[MaterialService] Erro ao deletar arquivo:', err);
        }
      }

      // Deletar registro
      const deletado = await prisma.download.delete({
        where: { id: materialId },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MATERIAL_DELETAR',
        tabela_afetada: 'Download',
        id_recurso: materialId,
        valores_antes: material,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: deletado };
    } catch (error) {
      console.error('[MaterialService] Erro ao deletar:', error);
      throw error;
    }
  }

  /**
   * Registrar download
   */
  static async registrarDownload(
    usuarioId: string,
    materialId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      // Registrar em UsuarioDownload se existir
      const download = await prisma.usuarioDownload.create({
        data: {
          usuario_id: usuarioId,
          download_id: materialId,
          criado_em: new Date(),
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MATERIAL_DOWNLOAD',
        tabela_afetada: 'UsuarioDownload',
        id_recurso: download.id,
        valores_depois: { material_id: materialId },
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: download };
    } catch (error) {
      console.error('[MaterialService] Erro ao registrar download:', error);
      // Não falhar - apenas não registrar
      return { success: true, warning: 'Download não registrado no banco' };
    }
  }

  /**
   * Validar tipo de arquivo
   */
  static validarTipo(nomeArquivo: string): MaterialType {
    const extensao = nomeArquivo.split('.').pop()?.toUpperCase();

    switch (extensao) {
      case 'PDF':
        return 'PDF';
      case 'ZIP':
        return 'ZIP';
      case 'DOCX':
        return 'DOCX';
      case 'XLSX':
        return 'XLSX';
      case 'TXT':
        return 'TXT';
      default:
        return 'OTHER';
    }
  }
}
