import { getCategories } from "@/lib/catalog/api";
import CategoriesCarousel from "./CategoriesCarousel";

// Categories have no image in the API yet, so cycle through the template artwork.
const IMAGES = Array.from(
  { length: 7 },
  (_, i) => `/images/categories/categories-0${i + 1}.png`,
);

const Categories = async () => {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  const items = categories.map((category, i) => ({
    id: category.id,
    title: category.title,
    img: IMAGES[i % IMAGES.length],
    href: `/shop-with-sidebar?category=${category.slug}`,
  }));

  return <CategoriesCarousel items={items} />;
};

export default Categories;
