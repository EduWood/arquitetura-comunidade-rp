import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const senhaHash = await bcrypt.hash('Senha123!', 10);
  
  // Criar usuário aluno
  try {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'aluno@teste.com',
        nome: 'João Silva',
        senha_hash: senhaHash,
        role: 'MEMBRO',
        status: 'ATIVO',
      },
    });
    console.log('✓ Usuário aluno criado:', usuario.email);
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('✓ Usuário aluno já existe');
    } else {
      throw e;
    }
  }

  // Criar usuário admin
  try {
    const admin = await prisma.usuario.create({
      data: {
        email: 'admin@teste.com',
        nome: 'Administrador',
        senha_hash: senhaHash,
        role: 'ADMIN',
        status: 'ATIVO',
      },
    });
    console.log('✓ Usuário admin criado:', admin.email);
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('✓ Usuário admin já existe');
    } else {
      throw e;
    }
  }

  console.log('\n✅ Seed concluído!');
  console.log('\n📝 Credenciais de teste:');
  console.log('   Aluno: aluno@teste.com / Senha123!');
  console.log('   Admin: admin@teste.com / Senha123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erro:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
