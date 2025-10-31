import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsOwner } from '@/hooks/useIsOwner';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus, UserMinus, Shield, StickyNote } from 'lucide-react';

interface User {
  id: string;
  discord_username: string | null;
  discord_id: string | null;
  is_server_member: boolean;
}

interface UserWithRole extends User {
  isAdmin: boolean;
}

interface PageNote {
  id: string;
  page_path: string;
  content: string;
  created_at: string;
  admin_id: string;
  profiles: {
    discord_username: string | null;
  };
}

export default function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  const isOwner = useIsOwner();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [notes, setNotes] = useState<PageNote[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [discordIdInput, setDiscordIdInput] = useState('');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error('Access denied');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      if (isOwner) {
        fetchNotes();
      }
    }
  }, [isAdmin, isOwner]);

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

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('page_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        // Fetch profiles for each note
        const notesWithProfiles = await Promise.all(
          data.map(async (note) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('discord_username')
              .eq('id', note.admin_id)
              .single();

            return {
              ...note,
              profiles: profile || { discord_username: null },
            };
          })
        );

        setNotes(notesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const addAdminByDiscordId = async () => {
    if (!discordIdInput.trim()) {
      toast.error('Please enter a Discord ID');
      return;
    }

    try {
      // Find user by Discord ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, discord_username')
        .eq('discord_id', discordIdInput.trim())
        .single();

      if (!profile) {
        toast.error('User not found. They must log in at least once before being made an admin.');
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: profile.id, role: 'admin' });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('User is already an admin');
        } else {
          throw error;
        }
      } else {
        toast.success(`Added ${profile.discord_username} as admin`);
        setDiscordIdInput('');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
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
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              {isOwner && <TabsTrigger value="notes">Page Notes</TabsTrigger>}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-neon-purple" />
                  User Management
                </h2>

                {isOwner && (
                  <div className="mb-6 p-4 rounded-lg bg-background/50 border border-primary/10">
                    <h3 className="font-semibold mb-3">Add Admin by Discord ID</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Note: Users must have logged in at least once before they can be made an admin.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={discordIdInput}
                        onChange={(e) => setDiscordIdInput(e.target.value)}
                        placeholder="Enter Discord ID (e.g. 123456789012345678)"
                        className="flex-1"
                      />
                      <Button onClick={addAdminByDiscordId}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Admin
                      </Button>
                    </div>
                  </div>
                )}

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

            {isOwner && (
              <TabsContent value="notes" className="space-y-4">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <StickyNote className="w-6 h-6 text-neon-green" />
                    Admin Notes History
                  </h2>

                  {loadingNotes ? (
                    <p className="text-muted-foreground">Loading notes...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-muted-foreground">No notes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-lg bg-background/50 border border-primary/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-neon-cyan">
                                Page: {note.page_path}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                By: {note.profiles?.discord_username || 'Unknown'} • {new Date(note.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            )}

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
