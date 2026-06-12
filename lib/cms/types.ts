// CMS Data Types e DTOs

export interface CMSHeroDTO {
  titulo: string;
  subtitulo: string;
  cta_texto: string;
  cta_url: string;
  imagem_url?: string;
  video_url?: string;
}

export interface CMSBeneficioDTO {
  titulo: string;
  descricao: string;
  icone?: string;
  ordem?: number;
}

export interface CMSSobreDTO {
  titulo: string;
  descricao: string;
  missao?: string;
  visao?: string;
  valores?: string;
  imagem_url?: string;
}

export interface CMSDepoimentoDTO {
  nome: string;
  profissao?: string;
  texto: string;
  avatar_url?: string;
  rating?: number;
  ordem?: number;
}

export interface CMSFaqDTO {
  pergunta: string;
  resposta: string;
  ordem?: number;
  ativo?: boolean;
}

export interface CMSContatoDTO {
  email: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  horario_atendimento?: string;
}

export interface CMSRedesSociaisDTO {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

export interface CMSSeoDTO {
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
}

export interface CMSBannerDTO {
  titulo: string;
  descricao?: string;
  imagem_url: string;
  cta_texto?: string;
  cta_url?: string;
  posicao: 'topo' | 'meio' | 'rodape';
  ativo: boolean;
  ordem?: number;
}

export interface CMSSeccaoUpdateDTO {
  conteudo: Record<string, any>;
  publicado?: boolean;
}

export interface CMSImagemDTO {
  nome: string;
  arquivo: File;
  descricao?: string;
  alt_text?: string;
}
