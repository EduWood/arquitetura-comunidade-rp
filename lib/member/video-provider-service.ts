// Serviço de Provedores de Vídeo
// Detecta, valida e extrai IDs de URLs de YouTube, Vimeo, Bunny Stream

export type VideoProvider = 'YOUTUBE' | 'VIMEO' | 'BUNNY' | 'UNKNOWN';

export interface VideoInfo {
  provider: VideoProvider;
  videoId?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
}

export class VideoProviderService {
  /**
   * Detectar provedor de vídeo da URL
   */
  static detectProvider(url: string): VideoProvider {
    if (!url) return 'UNKNOWN';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YOUTUBE';
    }
    if (url.includes('vimeo.com')) {
      return 'VIMEO';
    }
    if (url.includes('bunny') || url.includes('bunnycdn')) {
      return 'BUNNY';
    }

    return 'UNKNOWN';
  }

  /**
   * Validar URL de vídeo
   */
  static validateVideoUrl(url: string): boolean {
    try {
      const objUrl = new URL(url);
      const provider = this.detectProvider(url);

      if (provider === 'UNKNOWN') {
        return false;
      }

      // Validar que tem um ID extraível
      const idResult = this.extractVideoId(url);
      return !!idResult;
    } catch {
      return false;
    }
  }

  /**
   * Extrair ID do vídeo baseado no provedor
   */
  static extractVideoId(url: string): string | null {
    const provider = this.detectProvider(url);

    if (provider === 'YOUTUBE') {
      // Suportar: youtube.com/watch?v=ID ou youtu.be/ID
      const regex1 = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
      const match = url.match(regex1);
      return match?.[1] || null;
    }

    if (provider === 'VIMEO') {
      // vimeo.com/ID
      const regex = /vimeo\.com\/(\d+)/;
      const match = url.match(regex);
      return match?.[1] || null;
    }

    if (provider === 'BUNNY') {
      // bunny.net/watch?v=ID ou bunny.sh/ID
      const regex1 = /(?:bunny\.net|b\.bunny\.sh)\/(?:watch\?v=)?([^&\n?#]+)/;
      const match = url.match(regex1);
      return match?.[1] || null;
    }

    return null;
  }

  /**
   * Gerar URL de embed para o provedor
   */
  static generateEmbedUrl(videoId: string, provider: VideoProvider): string {
    switch (provider) {
      case 'YOUTUBE':
        return `https://www.youtube.com/embed/${videoId}`;
      case 'VIMEO':
        return `https://player.vimeo.com/video/${videoId}`;
      case 'BUNNY':
        return `https://iframe.mediadelivery.net/embed/${videoId}`;
      default:
        return '';
    }
  }

  /**
   * Gerar URL de thumbnail
   */
  static generateThumbnail(videoId: string, provider: VideoProvider): string {
    switch (provider) {
      case 'YOUTUBE':
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      case 'VIMEO':
        return `https://i.vimeocdn.com/video/${videoId}.jpg`;
      case 'BUNNY':
        return `https://cdn.bunny.sh/video/${videoId}/thumbnail.jpg`;
      default:
        return '';
    }
  }

  /**
   * Obter duração do vídeo (necessita API externa)
   * Por enquanto, retorna null
   */
  static async getDuration(videoId: string, provider: VideoProvider): Promise<number | null> {
    // TODO: Implementar chamadas a APIs externas
    // YouTube: https://www.googleapis.com/youtube/v3/videos?key=API_KEY&id=ID&part=contentDetails
    // Vimeo: https://vimeo.com/api/oembed.json?url=https://vimeo.com/ID
    // Bunny: Usar sua API

    console.warn('[VideoProviderService] getDuration não implementado');
    return null;
  }

  /**
   * Analisar URL completa e retornar informações do vídeo
   */
  static parseVideoUrl(url: string): VideoInfo {
    const provider = this.detectProvider(url);
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      return { provider: 'UNKNOWN' };
    }

    return {
      provider,
      videoId,
      thumbnailUrl: this.generateThumbnail(videoId, provider),
      embedUrl: this.generateEmbedUrl(videoId, provider),
    };
  }

  /**
   * Validar formato de URL
   */
  static isValidFormat(url: string): { valid: boolean; error?: string } {
    if (!url) {
      return { valid: false, error: 'URL não fornecida' };
    }

    if (!this.validateVideoUrl(url)) {
      return { valid: false, error: 'URL de vídeo inválida' };
    }

    const videoId = this.extractVideoId(url);
    if (!videoId) {
      return { valid: false, error: 'Não foi possível extrair o ID do vídeo' };
    }

    return { valid: true };
  }
}
