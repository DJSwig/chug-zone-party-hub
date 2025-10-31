import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus, UserMinus, Shield } from 'lucide-react';

interface User {
  id: string;
  discord_username: string | null;
  discord_id: string | null;
  is_server_member: boolean;
}

interface UserWithRole extends User {
  isAdmin: boolean;
}

export default function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error('Access denied');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: role } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .eq('role', 'admin')
              .single();

            return {
              ...profile,
              isAdmin: !!role,
            };
          })
        );

        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    try {
      if (currentlyAdmin) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        toast.success('Admin role removed');
      } else {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        toast.success('Admin role granted');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast.error('Failed to update role');
    }
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-purple via-neon-green to-neon-cyan bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage users, roles, and site settings
            </p>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-neon-purple" />
                  User Management
                </h2>

                {loadingUsers ? (
                  <p className="text-muted-foreground">Loading users...</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/10"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {user.discord_username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Discord ID: {user.discord_id}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {user.is_server_member && (
                              <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green">
                                Server Member
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="text-xs px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={user.isAdmin ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        >
                          {user.isAdmin ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
                <p className="text-muted-foreground">
                  Additional settings coming soon...
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
