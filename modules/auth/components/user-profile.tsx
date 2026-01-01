'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from '@/lib/auth-client';
import {
  LogOut,
  Settings,
  User,
  ChevronDown,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const UserProfile = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const onSubmit = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 pl-2 pr-3 rounded-full flex items-center gap-2 hover:bg-accent/50 transition-all group"
        >
          <Avatar className="h-8 w-8 border border-primary/20 transition-transform group-hover:scale-105">
            <AvatarImage
              src={session?.user?.image || "https://github.com/shadcn.png"}
              alt={session?.user?.name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 glass-card border-border/50 animate-in fade-in zoom-in-95 duration-200"
        align="end"
        forceMount
      >
        <div className="flex items-center gap-3 p-2 mb-1">
          <div className="bg-primary/10 p-1 rounded-full">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-bold text-foreground leading-none">
              {session?.user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground truncate w-40">
              {session?.user?.email || 'guest@example.com'}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary group">
            <User className="mr-2 h-4 w-4 text-muted-foreground group-focus:text-primary" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary group">
            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground group-focus:text-primary" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary group">
            <Settings className="mr-2 h-4 w-4 text-muted-foreground group-focus:text-primary" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem className="cursor-pointer focus:bg-purple-500/10 focus:text-purple-500 group">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              <span className="font-medium text-purple-500">Upgrade Plan</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={() => onSubmit()}
          className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-600 group"
        >
          <LogOut className="mr-2 h-4 w-4 group-focus:text-red-600" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;