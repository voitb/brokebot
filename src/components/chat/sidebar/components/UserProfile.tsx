import React from "react";
import { Link, useNavigate, createSearchParams } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
  LifeBuoy,
  FileText,
  Keyboard,
  Settings,
  Shield,
  CreditCard,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "../../../ui/dropdown-menu";
import { useUserConfig } from "@/hooks/business/useUserConfig";

const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { config: localUserConfig } = useUserConfig();
  const navigate = useNavigate();

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
    navigate({ search: createSearchParams({ modal: "shortcuts" }).toString() });
  };

  const openSettingsModal = (tab?: string) => {
    const params = new URLSearchParams({ modal: "settings" });
    if (tab) {
      params.set("tab", tab);
    }
    navigate({ search: params.toString() });
  };

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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem onClick={() => openSettingsModal("general")}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>General</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openSettingsModal("documents")}>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Documents</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openSettingsModal("privacy")}>
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Privacy</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openSettingsModal("billing")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={openShortcutsModal}>
              <Keyboard className="w-4 h-4 mr-2" />
              <span>Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/terms" target="_blank">
                <FileText className="w-4 h-4 mr-2" />
                <span>Terms of Service</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="w-4 h-4 mr-2" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {user ? (
            <DropdownMenuItem 
              onClick={logout}
              className="focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2 text-destructive" />
              <span className="text-destructive">Log out</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/login">
                <UserIcon className="w-4 h-4 mr-2" />
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
