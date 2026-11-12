import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Category } from '../src/modules/products/entities/category/category.entity';
import { SubCategory } from '../src/modules/products/entities/category/sub-category.entity';
import {
  Product,
  ProductStatus,
} from '../src/modules/products/entities/product/product.entity';
import { ProductVariant } from '../src/modules/products/entities/product/product-variant.entity';

// Fixed local fixtures: no external API is required. Prices are whole VND.
const categories = [
  { slug: 'fashion-men', name: 'Thời trang nam' },
  { slug: 'fashion-women', name: 'Thời trang nữ' },
] as const;

const subCategories = [
  { slug: 'fashion-men-tops', name: 'Áo nam', parentSlug: 'fashion-men' },
  { slug: 'fashion-men-bottoms', name: 'Quần nam', parentSlug: 'fashion-men' },
  { slug: 'fashion-women-tops', name: 'Áo nữ', parentSlug: 'fashion-women' },
  {
    slug: 'fashion-women-bottoms',
    name: 'Quần và chân váy nữ',
    parentSlug: 'fashion-women',
  },
] as const;

type SubCategorySlug = (typeof subCategories)[number]['slug'];

interface FashionProduct {
  slug: string;
  name: string;
  categorySlug: SubCategorySlug;
  description: string;
  unitPrice: string;
  color: string;
  material: string;
}

export const fashionProducts: readonly FashionProduct[] = [
  {
    slug: 'fashion-men-cotton-tee',
    name: 'Áo thun nam cotton basic',
    categorySlug: 'fashion-men-tops',
    description: 'Áo thun cổ tròn, phom regular, thoáng mát cho ngày thường.',
    unitPrice: '199000',
    color: 'Trắng',
    material: 'Cotton',
  },
  {
    slug: 'fashion-men-polo',
    name: 'Áo polo nam pique',
    categorySlug: 'fashion-men-tops',
    description: 'Áo polo vải pique có cổ, phù hợp đi làm và dạo phố.',
    unitPrice: '329000',
    color: 'Xanh navy',
    material: 'Cotton pique',
  },
  {
    slug: 'fashion-men-oxford-shirt',
    name: 'Áo sơ mi nam Oxford',
    categorySlug: 'fashion-men-tops',
    description: 'Sơ mi dài tay Oxford, cổ button-down, phom regular.',
    unitPrice: '459000',
    color: 'Xanh nhạt',
    material: 'Cotton Oxford',
  },
  {
    slug: 'fashion-men-hoodie',
    name: 'Áo hoodie nam nỉ',
    categorySlug: 'fashion-men-tops',
    description: 'Hoodie có mũ và túi trước, chất nỉ mềm giữ ấm.',
    unitPrice: '549000',
    color: 'Xám',
    material: 'Cotton pha polyester',
  },
  {
    slug: 'fashion-men-denim-jacket',
    name: 'Áo khoác denim nam',
    categorySlug: 'fashion-men-tops',
    description: 'Áo khoác denim cài nút, hai túi ngực, phong cách casual.',
    unitPrice: '799000',
    color: 'Xanh denim',
    material: 'Denim cotton',
  },
  {
    slug: 'fashion-men-straight-jeans',
    name: 'Quần jeans nam ống đứng',
    categorySlug: 'fashion-men-bottoms',
    description: 'Jeans ống đứng, cạp vừa, dễ phối với áo thun hoặc sơ mi.',
    unitPrice: '599000',
    color: 'Xanh đậm',
    material: 'Denim cotton',
  },
  {
    slug: 'fashion-men-chinos',
    name: 'Quần chinos nam',
    categorySlug: 'fashion-men-bottoms',
    description: 'Quần chinos phom regular, vải mềm cho trang phục công sở.',
    unitPrice: '499000',
    color: 'Be',
    material: 'Cotton twill',
  },
  {
    slug: 'fashion-men-joggers',
    name: 'Quần jogger nam',
    categorySlug: 'fashion-men-bottoms',
    description: 'Jogger cạp chun, bo gấu, phù hợp vận động nhẹ.',
    unitPrice: '359000',
    color: 'Đen',
    material: 'Cotton pha polyester',
  },
  {
    slug: 'fashion-men-shorts',
    name: 'Quần short nam kaki',
    categorySlug: 'fashion-men-bottoms',
    description: 'Short kaki trên gối, túi hai bên, phù hợp mùa hè.',
    unitPrice: '289000',
    color: 'Xanh olive',
    material: 'Cotton kaki',
  },
  {
    slug: 'fashion-men-linen-trousers',
    name: 'Quần dài nam linen',
    categorySlug: 'fashion-men-bottoms',
    description: 'Quần dài linen phom thoải mái, nhẹ và thoáng khí.',
    unitPrice: '529000',
    color: 'Kem',
    material: 'Linen pha cotton',
  },
  {
    slug: 'fashion-women-cotton-tee',
    name: 'Áo thun nữ cotton',
    categorySlug: 'fashion-women-tops',
    description: 'Áo thun nữ cổ tròn, phom regular, chất cotton mềm.',
    unitPrice: '179000',
    color: 'Trắng',
    material: 'Cotton',
  },
  {
    slug: 'fashion-women-blouse',
    name: 'Áo blouse nữ tay bồng',
    categorySlug: 'fashion-women-tops',
    description: 'Blouse cổ tròn, tay bồng nhẹ, phối cùng quần hoặc chân váy.',
    unitPrice: '389000',
    color: 'Hồng nhạt',
    material: 'Cotton poplin',
  },
  {
    slug: 'fashion-women-cardigan',
    name: 'Áo cardigan nữ',
    categorySlug: 'fashion-women-tops',
    description: 'Cardigan dệt kim cài nút, phù hợp khoác nhẹ khi đi làm.',
    unitPrice: '459000',
    color: 'Kem',
    material: 'Cotton dệt kim',
  },
  {
    slug: 'fashion-women-linen-shirt',
    name: 'Áo sơ mi nữ linen',
    categorySlug: 'fashion-women-tops',
    description: 'Sơ mi linen dài tay, phom rộng vừa, thoáng mát.',
    unitPrice: '429000',
    color: 'Xanh pastel',
    material: 'Linen pha cotton',
  },
  {
    slug: 'fashion-women-blazer',
    name: 'Áo blazer nữ',
    categorySlug: 'fashion-women-tops',
    description: 'Blazer một hàng nút, có lớp lót, phù hợp trang phục công sở.',
    unitPrice: '899000',
    color: 'Đen',
    material: 'Polyester pha viscose',
  },
  {
    slug: 'fashion-women-wide-jeans',
    name: 'Quần jeans nữ ống rộng',
    categorySlug: 'fashion-women-bottoms',
    description: 'Jeans cạp cao, ống rộng, phom thoải mái.',
    unitPrice: '579000',
    color: 'Xanh denim',
    material: 'Denim cotton',
  },
  {
    slug: 'fashion-women-tailored-trousers',
    name: 'Quần âu nữ',
    categorySlug: 'fashion-women-bottoms',
    description: 'Quần âu cạp cao, ống đứng, phù hợp đi làm.',
    unitPrice: '489000',
    color: 'Xám',
    material: 'Polyester pha viscose',
  },
  {
    slug: 'fashion-women-midi-skirt',
    name: 'Chân váy midi nữ',
    categorySlug: 'fashion-women-bottoms',
    description: 'Chân váy midi dáng chữ A, dài qua gối, có khóa bên.',
    unitPrice: '399000',
    color: 'Nâu',
    material: 'Cotton twill',
  },
  {
    slug: 'fashion-women-pleated-skirt',
    name: 'Chân váy xếp ly nữ',
    categorySlug: 'fashion-women-bottoms',
    description: 'Chân váy xếp ly dáng midi, cạp chun phía sau.',
    unitPrice: '449000',
    color: 'Be',
    material: 'Polyester',
  },
  {
    slug: 'fashion-women-linen-shorts',
    name: 'Quần short nữ linen',
    categorySlug: 'fashion-women-bottoms',
    description: 'Short linen cạp cao, túi hai bên, phom thoải mái.',
    unitPrice: '299000',
    color: 'Kem',
    material: 'Linen pha cotton',
  },
];

export async function seedProducts(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const result = await app.get(DataSource).transaction(async (manager) => {
      const categoryRepo = manager.getRepository(Category);
      const subCategoryRepo = manager.getRepository(SubCategory);
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);
      const categoryIds = new Map<string, string>();
      const subCategoryIds = new Map<string, string>();

      // Stable slugs/SKUs let subsequent runs update or restore these fixtures.
      // Only scalar fields are assigned, avoiding unintended relation cascades.
      for (const data of categories) {
        const existing = await categoryRepo.findOne({
          where: { slug: data.slug },
          withDeleted: true,
        });
        const saved = await categoryRepo.save(
          categoryRepo.create({
            id: existing?.id,
            ...data,
            description: `Bộ sưu tập ${data.name.toLowerCase()}.`,
            deletedAt: null,
          }),
        );
        categoryIds.set(data.slug, saved.id);
      }

      for (const { parentSlug, ...data } of subCategories) {
        const parentId = categoryIds.get(parentSlug);
        if (!parentId) throw new Error(`Missing category: ${parentSlug}`);
        const existing = await subCategoryRepo.findOne({
          where: { slug: data.slug },
          withDeleted: true,
        });
        const saved = await subCategoryRepo.save(
          subCategoryRepo.create({
            id: existing?.id,
            ...data,
            parentId,
            description: `Các mẫu ${data.name.toLowerCase()} trong bộ sưu tập.`,
            deletedAt: null,
          }),
        );
        subCategoryIds.set(data.slug, saved.id);
      }

      let variantCount = 0;
      for (const [index, data] of fashionProducts.entries()) {
        const categoryId = subCategoryIds.get(data.categorySlug);
        if (!categoryId)
          throw new Error(`Missing subcategory: ${data.categorySlug}`);
        const existing = await productRepo.findOne({
          where: { slug: data.slug },
          withDeleted: true,
        });
        const product = await productRepo.save(
          productRepo.create({
            id: existing?.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            status: ProductStatus.ACTIVE,
            categoryId,
            thumbnailUrl: null,
            deletedAt: null,
          }),
        );

        for (const [sizeIndex, size] of ['S', 'M', 'L'].entries()) {
          const sku = `FASHION-${String(index + 1).padStart(3, '0')}-${size}`;
          const existingVariant = await variantRepo.findOne({
            where: { sku },
            withDeleted: true,
          });
          await variantRepo.save(
            variantRepo.create({
              id: existingVariant?.id,
              productId: product.id,
              sku,
              name: `${data.color} / ${size}`,
              color: data.color,
              size,
              unitPrice: data.unitPrice,
              originalPrice:
                index % 4 === 0
                  ? (BigInt(data.unitPrice) + 50000n).toString()
                  : null,
              currency: 'VND',
              stock: 10 + sizeIndex * 5,
              imageUrl: null,
              attributes: {
                material: data.material,
                collection: 'Fashion essentials',
              },
              isActive: true,
              deletedAt: null,
            }),
          );
          variantCount++;
        }
      }

      return { productCount: fashionProducts.length, variantCount };
    });

    console.log(
      `Seed complete: ${result.productCount} fashion products, ${result.variantCount} variants, ${categories.length} categories and ${subCategories.length} subcategories seeded.`,
    );
  } finally {
    await app.close();
  }
}

// Importing fixtures for inspection never opens a database connection.
if (require.main === module) {
  seedProducts().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Product seeding failed: ${message}`);
    process.exitCode = 1;
  });
}
