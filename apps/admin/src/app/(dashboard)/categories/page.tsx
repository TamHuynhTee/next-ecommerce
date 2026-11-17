import { ConfirmDelete } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/api/catalog";

import { deleteCategoryAction, deleteSubCategoryAction } from "./actions";
import { CategoryDialog } from "./category-dialog";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">Organise products into categories and sub-categories</p>
        </div>
        <CategoryDialog kind="category" />
      </div>
      {categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : null}
      {categories.map((c) => (
        <Card key={c.id} className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{c.name}</CardTitle>
              <Badge variant="secondary">{c.status}</Badge>
              <span className="text-sm text-muted-foreground">/{c.slug}</span>
            </div>
            <div className="flex items-center">
              <CategoryDialog kind="category" item={c} />
              <ConfirmDelete
                title={`Delete "${c.name}"?`}
                description="The category must have no sub-categories."
                action={deleteCategoryAction.bind(null, c.id)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {c.subCategories.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-3 text-sm text-muted-foreground">/{s.slug}</span>
                </div>
                <div className="flex items-center">
                  <CategoryDialog kind="sub" parentId={c.id} item={s} />
                  <ConfirmDelete
                    title={`Delete "${s.name}"?`}
                    description="The sub-category must have no products."
                    action={deleteSubCategoryAction.bind(null, s.id)}
                  />
                </div>
              </div>
            ))}
            <CategoryDialog kind="sub" parentId={c.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
