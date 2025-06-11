import React from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
  LifeBuoy,
  FileText,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "../../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-auto px-2 py-2"
          >
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src="" /> {/* TODO: Add avatar from prefs */}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Terms of Service</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const LoginButton: React.FC = () => (
  <div className="p-4">
    <Button asChild className="w-full">
      <Link to="/login">
        <UserIcon className="mr-2 h-4 w-4" /> Login or Sign Up
      </Link>
    </Button>
  </div>
);

export const UserProfile: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return user ? <UserProfileMenu /> : <LoginButton />;
};
