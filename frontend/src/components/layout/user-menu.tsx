"use client";

import { LogOut, User, Settings, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl p-1 pr-2.5 transition-colors hover:bg-white/5">
          <Avatar className="h-7.5 w-7.5 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)] text-xs font-semibold text-black">
              KE
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">Kaushik</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-strong">
        <DropdownMenuLabel>
          <p className="font-medium">Kaushik Endluri</p>
          <p className="text-xs font-normal text-muted-foreground">kaushikendluri77@gmail.com</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings"><User /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings"><Settings /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard /> Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
