// CMS Content Validators

export class CMSValidator {
  static validateHero(data: any) {
    const errors: string[] = [];
    
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.push('Título é obrigatório');
    }
    if (!data.subtitulo || data.subtitulo.trim().length === 0) {
      errors.push('Subtítulo é obrigatório');
    }
    if (!data.cta_texto || data.cta_texto.trim().length === 0) {
      errors.push('Texto do botão CTA é obrigatório');
    }
    if (!data.cta_url || data.cta_url.trim().length === 0) {
      errors.push('URL do CTA é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateBeneficios(data: any[]) {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Benefícios deve ser um array');
      return { valid: false, errors };
    }
    
    data.forEach((item, idx) => {
      if (!item.titulo) errors.push(`Benefício ${idx + 1}: Título é obrigatório`);
      if (!item.descricao) errors.push(`Benefício ${idx + 1}: Descrição é obrigatória`);
    });
    
    return { valid: errors.length === 0, errors };
  }

  static validateSobre(data: any) {
    const errors: string[] = [];
    
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.push('Título é obrigatório');
    }
    if (!data.descricao || data.descricao.trim().length === 0) {
      errors.push('Descrição é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateDepoimentos(data: any[]) {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Depoimentos deve ser um array');
      return { valid: false, errors };
    }
    
    data.forEach((item, idx) => {
      if (!item.nome) errors.push(`Depoimento ${idx + 1}: Nome é obrigatório`);
      if (!item.texto) errors.push(`Depoimento ${idx + 1}: Texto é obrigatório`);
    });
    
    return { valid: errors.length === 0, errors };
  }

  static validateFAQ(data: any[]) {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('FAQ deve ser um array');
      return { valid: false, errors };
    }
    
    data.forEach((item, idx) => {
      if (!item.pergunta) errors.push(`FAQ ${idx + 1}: Pergunta é obrigatória`);
      if (!item.resposta) errors.push(`FAQ ${idx + 1}: Resposta é obrigatória`);
    });
    
    return { valid: errors.length === 0, errors };
  }

  static validateContato(data: any) {
    const errors: string[] = [];
    
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email válido é obrigatório');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateRedesSociais(data: any) {
    const errors: string[] = [];
    
    if (Object.keys(data).length === 0) {
      errors.push('Pelo menos uma rede social é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateSEO(data: any) {
    const errors: string[] = [];
    
    if (!data.meta_title || data.meta_title.trim().length === 0) {
      errors.push('Meta title é obrigatório');
    }
    if (!data.meta_description || data.meta_description.trim().length === 0) {
      errors.push('Meta description é obrigatória');
    }
    if (data.meta_title && data.meta_title.length > 60) {
      errors.push('Meta title deve ter no máximo 60 caracteres');
    }
    if (data.meta_description && data.meta_description.length > 160) {
      errors.push('Meta description deve ter no máximo 160 caracteres');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateBanners(data: any[]) {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Banners deve ser um array');
      return { valid: false, errors };
    }
    
    data.forEach((item, idx) => {
      if (!item.titulo) errors.push(`Banner ${idx + 1}: Título é obrigatório`);
      if (!item.imagem_url) errors.push(`Banner ${idx + 1}: Imagem URL é obrigatória`);
      if (!['topo', 'meio', 'rodape'].includes(item.posicao)) {
        errors.push(`Banner ${idx + 1}: Posição inválida`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }

  private static isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
