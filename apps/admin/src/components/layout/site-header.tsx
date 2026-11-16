import { Bell, CircleHelp, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@/lib/mock-data";

import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="h-9 border-0 bg-muted pl-9 shadow-none" />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Help">
          <CircleHelp className="size-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New order #3210 received</DropdownMenuItem>
            <DropdownMenuItem>Low stock: Wireless Headphones</DropdownMenuItem>
            <DropdownMenuItem>3 new customers signed up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 flex items-center gap-3 rounded-md p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium">{currentUser.name}</span>
                <span className="block text-xs text-muted-foreground">{currentUser.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
