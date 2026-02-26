// Script to check database content
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Articles in Database ===\n');
  
  const articles = await prisma.article.findMany({
    include: {
      category: true,
      author: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total articles: ${articles.length}\n`);

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Status: ${article.status}`);
    console.log(`   Category: ${article.category?.name || 'Sin categoría'}`);
    console.log(`   Cover Image: ${article.coverImage || 'No image'}`);
    console.log(`   Published: ${article.publishedAt || 'Not published'}`);
    console.log(`   Author: ${article.author?.name || 'Unknown'}`);
    console.log('');
  });

  console.log('\n=== Categories ===\n');
  
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  categories.forEach((cat) => {
    console.log(`- ${cat.name} (${cat.slug}): ${cat._count.articles} articles`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
