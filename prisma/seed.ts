const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seed...');

  // First, delete any existing relationships
  console.log('1️⃣ Deleting existing CategoriesOnProducts...');
  const deletedRelations = await prisma.categoriesOnProducts.deleteMany({});
  console.log(`   ✓ Deleted ${deletedRelations.count} category-product relations`);
  
  // Then delete existing categories
  console.log('2️⃣ Deleting existing Categories...');
  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`   ✓ Deleted ${deletedCategories.count} categories`);

  // Create main categories first
  console.log('3️⃣ Creating main categories...');
  const mainCategories = await prisma.category.createMany({
    data: [
      { name: 'AI & ML', description: 'Artificial Intelligence and Machine Learning tools', order: 1 },
      { name: 'Development', description: 'Software Development Tools', order: 2 },
      { name: 'Design', description: 'Design and Creative Tools', order: 3 },
      { name: 'Marketing', description: 'Marketing and Business Tools', order: 4 },
      { name: 'Productivity', description: 'Productivity Tools', order: 5 }
    ],
    skipDuplicates: true
  });
  console.log(`   ✓ Created ${mainCategories.count} main categories`);

  // Get the created categories to use their IDs for subcategories
  console.log('4️⃣ Fetching main categories for subcategory creation...');
  const aiCategory = await prisma.category.findUnique({ where: { name: 'AI & ML' } });
  console.log(`   ✓ AI Category ID: ${aiCategory?.id}`);
  const devCategory = await prisma.category.findUnique({ where: { name: 'Development' } });
  console.log(`   ✓ Development Category ID: ${devCategory?.id}`);
  const designCategory = await prisma.category.findUnique({ where: { name: 'Design' } });
  console.log(`   ✓ Design Category ID: ${designCategory?.id}`);
  const marketingCategory = await prisma.category.findUnique({ where: { name: 'Marketing' } });
  console.log(`   ✓ Marketing Category ID: ${marketingCategory?.id}`);
  const productivityCategory = await prisma.category.findUnique({ where: { name: 'Productivity' } });
  console.log(`   ✓ Productivity Category ID: ${productivityCategory?.id}`);

  // Create subcategories with detailed logging
  console.log('5️⃣ Creating subcategories...');
  
  if (aiCategory) {
    const aiSubcats = await prisma.category.createMany({
      data: [
        { name: 'ChatGPT Tools', description: 'ChatGPT-powered applications', parentId: aiCategory.id, order: 1 },
        { name: 'Image Generation', description: 'AI Image Generation tools', parentId: aiCategory.id, order: 2 },
        { name: 'Machine Learning', description: 'ML and Data Science tools', parentId: aiCategory.id, order: 3 }
      ]
    });
    console.log(`   ✓ Created ${aiSubcats.count} AI subcategories`);
  }

  if (devCategory) {
    const devSubcats = await prisma.category.createMany({
      data: [
        { name: 'IDEs & Editors', description: 'Development Environments', parentId: devCategory.id, order: 1 },
        { name: 'APIs & Backend', description: 'API and Backend tools', parentId: devCategory.id, order: 2 },
        { name: 'DevOps', description: 'DevOps and Infrastructure tools', parentId: devCategory.id, order: 3 }
      ]
    });
    console.log(`   ✓ Created ${devSubcats.count} Development subcategories`);
  }

  if (designCategory) {
    const designSubcats = await prisma.category.createMany({
      data: [
        { name: 'UI Design', description: 'UI Design tools', parentId: designCategory.id, order: 1 },
        { name: '3D & Motion', description: '3D and Motion Design', parentId: designCategory.id, order: 2 },
        { name: 'Prototyping', description: 'Prototyping tools', parentId: designCategory.id, order: 3 }
      ]
    });
    console.log(`   ✓ Created ${designSubcats.count} Design subcategories`);
  }

  if (marketingCategory) {
    const marketingSubcats = await prisma.category.createMany({
      data: [
        { name: 'SEO', description: 'SEO Tools', parentId: marketingCategory.id, order: 1 },
        { name: 'Social Media', description: 'Social Media Management', parentId: marketingCategory.id, order: 2 },
        { name: 'Analytics', description: 'Marketing Analytics', parentId: marketingCategory.id, order: 3 }
      ]
    });
    console.log(`   ✓ Created ${marketingSubcats.count} Marketing subcategories`);
  }

  if (productivityCategory) {
    const productivitySubcats = await prisma.category.createMany({
      data: [
        { name: 'Task Management', description: 'Task and Project Management', parentId: productivityCategory.id, order: 1 },
        { name: 'Note Taking', description: 'Note Taking Apps', parentId: productivityCategory.id, order: 2 },
        { name: 'Calendar', description: 'Calendar and Scheduling', parentId: productivityCategory.id, order: 3 }
      ]
    });
    console.log(`   ✓ Created ${productivitySubcats.count} Productivity subcategories`);
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });