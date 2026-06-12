// Hostinger Upload Service - Gerencia uploads de arquivos

import fs from 'fs';
import path from 'path';

export interface UploadResponse {
  success: boolean;
  path?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  error?: string;
}

export class HostingerUploadService {
  private static baseStoragePath = process.env.HOSTINGER_STORAGE_PATH || '/home/u123456789/public_html/uploads/cms';
  private static basePublicUrl = process.env.HOSTINGER_PUBLIC_URL || 'https://example.com/uploads/cms';
  private static maxFileSize = 50 * 1024 * 1024; // 50MB

  /**
   * Fazer upload de arquivo
   */
  static async uploadArquivo(
    arquivo: File,
    pasta: string = 'imagens'
  ): Promise<UploadResponse> {
    try {
      // Validar arquivo
      const validacao = this.validarArquivo(arquivo);
      if (!validacao.valid) {
        return {
          success: false,
          error: validacao.error,
        };
      }

      // Criar diretório se não existir
      const uploadDir = path.join(this.baseStoragePath, pasta);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Gerar nome único para arquivo
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const nomeOriginal = arquivo.name.split('.').slice(0, -1).join('.');
      const extensao = arquivo.name.split('.').pop();
      const nomeArquivo = `${nomeOriginal}-${timestamp}-${randomStr}.${extensao}`;

      // Salvar arquivo
      const caminhoCompleto = path.join(uploadDir, nomeArquivo);
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      fs.writeFileSync(caminhoCompleto, buffer);

      // Gerar URL pública
      const urlPublica = `${this.basePublicUrl}/${pasta}/${nomeArquivo}`;
      const caminhoRelativo = `cms/${pasta}/${nomeArquivo}`;

      return {
        success: true,
        path: caminhoRelativo,
        url: urlPublica,
        filename: nomeArquivo,
        mimeType: arquivo.type,
        size: arquivo.size,
      };
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao fazer upload:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload do arquivo',
      };
    }
  }

  /**
   * Deletar arquivo
   */
  static async deletarArquivo(caminhoRelativo: string): Promise<UploadResponse> {
    try {
      const caminhoCompleto = path.join(this.baseStoragePath, caminhoRelativo);

      // Validar caminho (segurança)
      if (!caminhoCompleto.startsWith(this.baseStoragePath)) {
        return {
          success: false,
          error: 'Caminho inválido',
        };
      }

      if (fs.existsSync(caminhoCompleto)) {
        fs.unlinkSync(caminhoCompleto);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao deletar arquivo:', error);
      return {
        success: false,
        error: 'Erro ao deletar arquivo',
      };
    }
  }

  /**
   * Validar arquivo antes do upload
   */
  private static validarArquivo(arquivo: File) {
    // Tipos permitidos
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF, WebP ou SVG.',
      };
    }

    // Tamanho máximo
    if (arquivo.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: 50MB, Seu arquivo: ${(arquivo.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Validar nome
    const nomeValido = /^[\w\s\-\.]+$/.test(arquivo.name.split('.').slice(0, -1).join('.'));
    if (!nomeValido) {
      return {
        valid: false,
        error: 'Nome do arquivo contém caracteres inválidos',
      };
    }

    return { valid: true };
  }

  /**
   * Obter informações de arquivo
   */
  static obterInfoArquivo(caminhoRelativo: string) {
    try {
      const caminhoCompleto = path.join(this.baseStoragePath, caminhoRelativo);

      if (!fs.existsSync(caminhoCompleto)) {
        return {
          success: false,
          error: 'Arquivo não encontrado',
        };
      }

      const stats = fs.statSync(caminhoCompleto);
      const urlPublica = `${this.basePublicUrl}/${caminhoRelativo}`;

      return {
        success: true,
        size: stats.size,
        modified: stats.mtime,
        url: urlPublica,
      };
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao obter info:', error);
      return {
        success: false,
        error: 'Erro ao obter informações do arquivo',
      };
    }
  }

  /**
   * Verificar se arquivo existe
   */
  static async verificarArquivo(caminhoRelativo: string): Promise<boolean> {
    try {
      const caminhoCompleto = path.join(this.baseStoragePath, caminhoRelativo);

      // Validar caminho (segurança)
      if (!caminhoCompleto.startsWith(this.baseStoragePath)) {
        return false;
      }

      return fs.existsSync(caminhoCompleto);
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao verificar arquivo:', error);
      return false;
    }
  }

  /**
   * Obter tamanho do arquivo
   */
  static async obterTamanhoArquivo(caminhoRelativo: string): Promise<number | null> {
    try {
      const caminhoCompleto = path.join(this.baseStoragePath, caminhoRelativo);

      // Validar caminho (segurança)
      if (!caminhoCompleto.startsWith(this.baseStoragePath)) {
        return null;
      }

      if (!fs.existsSync(caminhoCompleto)) {
        return null;
      }

      const stats = fs.statSync(caminhoCompleto);
      return stats.size;
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao obter tamanho:', error);
      return null;
    }
  }

  /**
   * Mover arquivo de um local para outro
   */
  static async moverArquivo(
    caminhoOrigem: string,
    caminhoDestino: string
  ): Promise<UploadResponse> {
    try {
      const caminhoCompletoOrigem = path.join(this.baseStoragePath, caminhoOrigem);
      const caminhoCompletoDestino = path.join(this.baseStoragePath, caminhoDestino);

      // Validar caminhos (segurança)
      if (!caminhoCompletoOrigem.startsWith(this.baseStoragePath) ||
          !caminhoCompletoDestino.startsWith(this.baseStoragePath)) {
        return {
          success: false,
          error: 'Caminho inválido',
        };
      }

      // Verificar origem
      if (!fs.existsSync(caminhoCompletoOrigem)) {
        return {
          success: false,
          error: 'Arquivo de origem não encontrado',
        };
      }

      // Criar diretório de destino se não existir
      const dirDestino = path.dirname(caminhoCompletoDestino);
      if (!fs.existsSync(dirDestino)) {
        fs.mkdirSync(dirDestino, { recursive: true });
      }

      // Mover arquivo
      fs.renameSync(caminhoCompletoOrigem, caminhoCompletoDestino);

      return {
        success: true,
        path: caminhoDestino,
      };
    } catch (error) {
      console.error('[HostingerUploadService] Erro ao mover arquivo:', error);
      return {
        success: false,
        error: 'Erro ao mover arquivo',
      };
    }
  }
}

