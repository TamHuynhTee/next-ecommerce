export type Category = {
  id: string;
  slug: string;
  title: string;
  subCategories: { id: string; slug: string; title: string }[];
};
