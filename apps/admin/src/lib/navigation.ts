import { FolderTree, LayoutDashboard, Package, Settings, ShoppingCart, Users, type LucideIcon } from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon; badge?: number };
export type NavGroup = { label: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories", href: "/categories", icon: FolderTree },
      { title: "Orders", href: "/orders", icon: ShoppingCart },
      { title: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];
