import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield } from 'lucide-react';

export function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button onClick={() => navigate('/auth')} variant="outline">
        Sign In
      </Button>
    );
  }

  const avatarUrl = profile?.discord_avatar
    ? `https://cdn.discordapp.com/avatars/${profile.discord_id}/${profile.discord_avatar}.png`
    : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={profile?.discord_username || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.discord_username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.discord_username}</p>
            {profile?.is_server_member && (
              <p className="text-xs text-neon-green">Server Member</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {profile?.is_server_member && (
          <DropdownMenuItem onClick={() => navigate('/customization')}>
            <Settings className="mr-2 h-4 w-4" />
            Customization
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
