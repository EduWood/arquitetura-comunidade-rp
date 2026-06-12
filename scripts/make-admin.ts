import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = 'codehashsistemas@gmail.com';

  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    const updated = await prisma.usuario.update({
      where: { email },
      data: {
        role: 'ADMIN',
      },
    });

    console.log(`✓ Usuário ${email} agora é ADMIN`);
    console.log(`Dados: ${JSON.stringify(updated, null, 2)}`);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
