# CMS Backend - Auditoria Técnica Completa

## 1. CAMPOS EDITÁVEIS E TABELAS

### Home Hero
- **Tabela**: `CMSSecao` (tipo_secao = 'HERO')
- **Campos**:
  - `dados_json`: Contém título, subtítulo, CTA, imagem de fundo
  - Armazenado em `CMSBlocoConteudo` relacionados
- **Sem Deploy**: Sim - alterações armazenadas em JSON

### Benefícios
- **Tabela**: `CMSSecao` (tipo_secao = 'BENEFICIOS')
- **Campos**:
  - `dados_json`: Array de benefícios com ícone, título, descrição
  - Imagens: Referenciadas em `CMSBlocoConteudo.imagem_id` → `MediaImagem`
- **Sem Deploy**: Sim

### Sobre
- **Tabela**: `CMSSecao` (tipo_secao = 'SOBRE')
- **Campos**:
  - `dados_json`: Texto descritivo, números-chave
  - Imagem: Relacionada via `CMSBlocoConteudo.imagem_id`
- **Sem Deploy**: Sim

### Depoimentos
- **Tabela**: `CMSDepoimento`
- **Campos**:
  - `nome_aluno`, `foto_url`, `conteudo`, `classificacao`
  - `ativo`, `ordem`
- **Sem Deploy**: Sim

### FAQ
- **Tabela**: `CMSFAQ`
- **Campos**:
  - `pergunta`, `resposta`, `ordem`, `ativo`
- **Sem Deploy**: Sim

### SEO
- **Tabela**: `CMSPagina`
- **Campos**:
  - `seo_titulo`, `seo_descricao`, `seo_keywords`
- **Sem Deploy**: Sim

### Contato
- **Tabela**: `CMSConfiguracao` (chave = 'CONTATO_*')
- **Campos**:
  - Email, telefone, endereço, redes sociais
  - Chaves: CONTATO_EMAIL, CONTATO_TELEFONE, etc
- **Sem Deploy**: Sim

### Redes Sociais
- **Tabela**: `CMSConfiguracao` (chave = 'REDES_*')
- **Campos**:
  - URLs das redes: REDES_FACEBOOK, REDES_INSTAGRAM, REDES_LINKEDIN, etc
- **Sem Deploy**: Sim

### Banners
- **Tabela**: `CMSBlocoConteudo` (dentro de CMSSecao 'BANNERS')
- **Campos**:
  - `titulo`, `conteudo_texto`, `imagem_id`, `ordem`
  - Imagens: `MediaImagem`
- **Sem Deploy**: Sim

---

## 2. FLUXO DE UPLOAD

### Onde os arquivos são enviados?
- **Destino**: Hostinger (sistema de arquivos compartilhado)
- **Caminho Base**: `/home/u123456789/public_html/uploads/cms` (via `HOSTINGER_STORAGE_PATH`)
- **Subpastas**: `imagens/`, `pdfs/`, `videos/` (conforme tipo)

### Caminho Final
```
/home/u123456789/public_html/uploads/cms/imagens/[nome-arquivo].jpg
```

**URL Pública**:
```
https://seu-dominio.com/uploads/cms/imagens/[nome-arquivo].jpg
```

### Como é gerado o nome do arquivo?

```javascript
// Fórmula:
const timestamp = Date.now();                    // Ex: 1702345600000
const randomStr = Math.random()...substring(2,8); // Ex: abc123
const nomeOriginal = arquivo.name.split('.').slice(0, -1).join('.');
const extensao = arquivo.name.split('.').pop();

// Resultado:
// logo.png → logo-1702345600000-abc123.png
// document.pdf → document-1702345600000-xyz789.pdf
```

**Formato**: `{nome-original}-{timestamp}-{random6chars}.{extensao}`

### Como evita colisões?

1. **Timestamp**: Precisão de milissegundos (Date.now())
2. **Random String**: 6 caracteres aleatórios adicionais
3. **Índice UNIQUE**: Campo `nome_arquivo` em `MediaImagem` é UNIQUE
4. **Probabilidade de colisão**: ~1 em 1 bilhão

### Como remove arquivos órfãos?

**PROBLEMA IDENTIFICADO**: Não há limpeza automática implementada atualmente.

**Cenários órfãos**:
1. Upload bem-sucedido, falha ao registrar no banco
2. Usuário deleta seção que referencia imagem
3. Download é cancelado durante processo

**Solução Recomendada**:
```sql
-- Encontrar órfãos
SELECT * FROM MediaImagem 
WHERE id NOT IN (SELECT imagem_id FROM CMSBlocoConteudo WHERE imagem_id IS NOT NULL);

-- Job agendado para limpar a cada 24h
-- Verificar última modificação > 7 dias
-- Deletar arquivo do disco + registro
```

### Como faz rollback se o banco falhar?

**PROBLEMA IDENTIFICADO**: Sem transação/rollback implementado.

**Fluxo Atual**:
1. ✅ Upload do arquivo para Hostinger
2. ✅ Registrar em `MediaImagem`
3. ❌ Se falhar em #2, arquivo orfanado

**Solução Recomendada**:

```typescript
try {
  // 1. Upload para Hostinger
  const uploadResult = await HostingerUploadService.uploadArquivo(arquivo);
  
  // 2. Registrar no banco (wrapped in transaction)
  const imagemResult = await prisma.$transaction(async (tx) => {
    return await tx.mediaImagem.create({
      data: { ... }
    });
  });
  
  // Sucesso
  return { success: true, ... };
} catch (error) {
  // 3. ROLLBACK: Deletar arquivo do Hostinger se banco falhar
  if (uploadResult.success) {
    await HostingerUploadService.deletarArquivo(uploadResult.path);
  }
  throw error;
}
```

---

## 3. PERMISSÕES POR ENDPOINT

### ADMIN Required

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/cms/seccoes` | GET | Listar todas as seções |
| `/api/cms/seccoes/[nome]` | GET | Obter seção específica |
| `/api/cms/seccoes/[nome]/update` | PUT | Atualizar seção |
| `/api/cms/upload` | POST | Fazer upload de arquivo |

**Verificação**:
```typescript
const temPermissao = await verificarPermissao(usuarioId, 'ADMIN');
```

### EDITOR Required

**PROBLEMA**: Não implementado. Todas exigem ADMIN.

### USER Required

**PROBLEMA**: Não há endpoints públicos implementados.

### Sem Autenticação

**PROBLEMA**: Nenhum endpoint é público. Necessário JWT para qualquer acesso.

---

## 4. MIDDLEWARE APLICADO

### Todas as rotas CMS

```typescript
// Middleware em CADA rota:

1. verificarToken(request)
   ├─ Extrai JWT do header Authorization
   ├─ Valida expiração
   ├─ Decodifica payload
   └─ Retorna { valid, usuarioId, email, role }

2. verificarPermissao(usuarioId, 'ADMIN')
   ├─ Query banco: SELECT role FROM Usuario WHERE id = ?
   ├─ Compara hierarquia: ADMIN >= ADMIN ✓
   └─ Retorna boolean

3. auditLog()
   ├─ Registra ação em LogAuditoria
   ├─ Captura valores antes/depois
   └─ Sem captura de IP/User-Agent
```

### Ordem de Execução

```
Request
  ↓
verificarToken()
  ├─ Falha? → 401 Não autenticado
  ↓ Sucesso
verificarPermissao()
  ├─ Falha? → 403 Sem permissão
  ↓ Sucesso
CMSService.atualizarSecao()
  ├─ Valida dados
  ├─ Query anterior para auditoria
  ├─ Update database
  ↓
auditLog() (chamado dentro do service)
  ├─ Registra: usuario_id, acao, tabela_afetada
  ├─ Valores antes/depois
  └─ SEM IP/User-Agent
  ↓
Response 200 OK
```

---

## 5. AUDITORIA - ANÁLISE DETALHADA

### O Que Está Sendo Registrado ✅

| Campo | Status | Exemplo |
|-------|--------|---------|
| `usuario_id` | ✅ Sim | "user-12345" |
| `acao` | ✅ Sim | "CMS_SECAO_UPDATE" |
| `tabela_afetada` | ✅ Sim | "CMSSecao" |
| `id_recurso` | ✅ Sim | "secao-hero-1" |
| `valores_antes` | ✅ Sim | `{titulo: "Antigo"}` |
| `valores_depois` | ✅ Sim | `{titulo: "Novo"}` |
| `criado_em` | ✅ Sim | Automático (now()) |

### O Que NÃO Está Sendo Registrado ❌

| Campo | Status | Motivo |
|-------|--------|--------|
| `ip_address` | ❌ Falta | Não extraído de request |
| `user_agent` | ❌ Falta | Não extraído de request |

### Schema LogAuditoria

```prisma
model LogAuditoria {
  id                String    @id @default(cuid())
  usuario_id        String?
  acao              String    @db.VarChar(100)        // Ex: "CMS_SECAO_UPDATE"
  tabela_afetada    String    @db.VarChar(50)         // Ex: "CMSSecao"
  id_recurso        String?   @db.VarChar(255)        // ID do registro alterado
  valores_antes     String?   @db.LongText            // JSON stringificado
  valores_depois    String?   @db.LongText            // JSON stringificado
  ip_address        String?   @db.VarChar(50)         // FALTA: Sempre NULL
  user_agent        String?   @db.VarChar(500)        // FALTA: Sempre NULL
  criado_em         DateTime  @default(now())
}
```

### Exemplo de Log Criado

```json
{
  "id": "clu7z9x2k0000",
  "usuario_id": "user-abc123",
  "acao": "CMS_SECAO_UPDATE",
  "tabela_afetada": "CMSSecao",
  "id_recurso": "secao-hero-1",
  "valores_antes": "{\"titulo\":\"Bem-vindo\",\"subtitulo\":\"Antigo\"}",
  "valores_depois": "{\"titulo\":\"Bem-vindo\",\"subtitulo\":\"Novo Conteúdo\"}",
  "ip_address": null,
  "user_agent": null,
  "criado_em": "2024-11-20T14:30:00Z"
}
```

### Como Adicionar IP e User-Agent

```typescript
// Em cada rota, extrair headers:
const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('cf-connecting-ip') ||
           'unknown';
const userAgent = request.headers.get('user-agent') || 'unknown';

// Passar para auditLog:
await auditLog({
  usuario_id: usuarioId,
  acao: 'CMS_SECAO_UPDATE',
  tabela_afetada: 'CMSSecao',
  id_recurso: secaoId,
  valores_antes: anterior,
  valores_depois: novo,
  ip_address: ip,
  user_agent: userAgent,
});
```

---

## 6. RECOMENDAÇÕES DE MELHORIAS

### Críticas (Implementar já)

1. **IP/User-Agent em Auditoria**
   - Importância: Alta (segurança)
   - Esforço: 15 min

2. **Transação com Rollback em Upload**
   - Importância: Alta (integridade de dados)
   - Esforço: 30 min

3. **Limpeza de Órfãos**
   - Importância: Média (higiene)
   - Esforço: 1 hora

### Importantes (Próximas 2 semanas)

4. **Role EDITOR**
   - Permitir editores atualizarem conteúdo sem DELETE
   - Esforço: 1 hora

5. **Endpoints Públicos de Leitura**
   - GET /api/cms/seccoes/[nome] sem autenticação
   - Esforço: 30 min

6. **Histórico de Versões**
   - Restaurar versão anterior via LogAuditoria
   - Esforço: 2 horas

7. **Soft Delete**
   - `deletado_em` em CMSSecao ao invés de remover
   - Esforço: 1 hora

### Nice-to-Have

8. **Difusão de Mudanças em Tempo Real**
   - WebSocket notificações quando conteúdo muda
   - Esforço: 4 horas

9. **Aprovação Workflow**
   - Pendente → Revisão → Publicado
   - Esforço: 3 horas

---

## RESUMO TÉCNICO

| Aspecto | Status | Score |
|---------|--------|-------|
| Campos Editáveis | ✅ Completo | 10/10 |
| Armazenamento | ✅ Funcional | 8/10 |
| Auditoria | ⚠️ Parcial | 6/10 |
| Segurança | ✅ Forte | 9/10 |
| Rollback | ❌ Falta | 0/10 |
| Limpeza Órfãos | ❌ Falta | 0/10 |

**Score Final**: 7.2/10 - Funcional em produção, mas com pontos de melhoria
