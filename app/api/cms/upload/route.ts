// POST /api/cms/upload - Upload de arquivo para CMS

import { NextRequest, NextResponse } from 'next/server';
import { HostingerUploadService } from '@/lib/cms/upload-service';
import { CMSImageService } from '@/lib/cms/image-service';
import { verificarToken } from '@/lib/auth/token-verification';
import { verificarPermissao } from '@/lib/auth/permission-checker';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const tokenResult = await verificarToken(request);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissão ADMIN
    const temPermissao = await verificarPermissao(
      tokenResult.usuarioId!,
      'ADMIN'
    );
    if (!temPermissao) {
      return NextResponse.json(
        { error: 'Sem permissão para fazer upload' },
        { status: 403 }
      );
    }

    // Obter form data
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File;
    const pasta = formData.get('pasta') as string || 'imagens';

    if (!arquivo) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Fazer upload
    const uploadResult = await HostingerUploadService.uploadArquivo(
      arquivo,
      pasta
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    // Registrar no banco
    const imagemResult = await CMSImageService.registrarImagem(
      arquivo.name,
      uploadResult.path!,
      uploadResult.url!,
      uploadResult.filename!,
      uploadResult.mimeType!,
      uploadResult.size!,
      tokenResult.usuarioId!
    );

    return NextResponse.json(imagemResult, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cms/upload] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
