// Script to add a test article in Empresas category
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get Empresas category
  const empresas = await prisma.category.findFirst({ where: { slug: 'empresas' } });
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  if (!empresas) {
    console.log('Empresas category not found');
    return;
  }
  
  if (!admin) {
    console.log('Admin user not found');
    return;
  }

  console.log('Found category:', empresas.name, empresas.id);
  console.log('Found admin:', admin.name, admin.id);

  const article = await prisma.article.create({
    data: {
      title: 'YPF anuncia inversiones millonarias en Vaca Muerta para 2026',
      slug: 'ypf-inversiones-vaca-muerta-2026',
      excerpt: 'La petrolera estatal planea destinar más de 5.000 millones de dólares en el desarrollo de shale oil y gas durante el próximo año fiscal.',
      content: '<p>YPF, la principal empresa energética argentina, anunció un ambicioso plan de inversiones para el desarrollo de Vaca Muerta durante 2026.</p><p>El CEO de la compañía destacó que estas inversiones posicionarán a Argentina como uno de los principales exportadores de energía de la región.</p>',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      categoryId: empresas.id,
      authorId: admin.id,
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
    }
  });
  
  console.log('\n✓ Article created successfully!');
  console.log('  Title:', article.title);
  console.log('  Category:', empresas.name);
  console.log('  Status:', article.status);
  console.log('  Slug:', article.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
