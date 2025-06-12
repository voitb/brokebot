import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
  LifeBuoy,
  FileText,
  Keyboard,
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
import { useUserConfig } from "@/hooks/business/useUserConfig";

const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { config: localUserConfig } = useUserConfig();  

  if (!localUserConfig) {
    return null;
  }

  const displayName = user?.name || localUserConfig.username;
  const displaySubtext = user?.email || "Local Profile";
  const avatarUrl = localUserConfig.avatarUrl;

  const initials = (displayName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const openShortcutsModal = () => {
    console.log("openShortcutsModal");
  }

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-auto px-2 py-2"
          >
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {displaySubtext}
              </p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {displaySubtext}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={openShortcutsModal}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/terms" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                <span>Terms of Service</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {user ? (
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/login">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Login or Sign Up</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const UserProfile: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const { isLoading: isConfigLoading } = useUserConfig();

  const isLoading = isAuthLoading || isConfigLoading;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return <UserProfileMenu />;
};
