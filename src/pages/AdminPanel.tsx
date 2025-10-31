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
import { ArrowLeft, UserPlus, UserMinus, Shield, StickyNote, Database, Trash2, Edit, Plus } from 'lucide-react';

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
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);

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
        fetchTables();
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

  const fetchTables = async () => {
    // List all known public tables
    setTables(['profiles', 'user_roles', 'customizations', 'game_sessions', 'session_players', 'horse_race_state', 'page_notes']);
  };

  const fetchTableData = async (tableName: string) => {
    setLoadingTables(true);
    try {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .limit(100);

      if (error) throw error;
      setTableData(data || []);
      setSelectedTable(tableName);
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast.error('Failed to load table data');
    } finally {
      setLoadingTables(false);
    }
  };

  const deleteRow = async (tableName: string, rowId: string) => {
    try {
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', rowId);

      if (error) throw error;
      toast.success('Row deleted successfully');
      fetchTableData(tableName);
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete row');
    }
  };

  const updateRow = async (tableName: string, rowData: any) => {
    try {
      const { error } = await (supabase as any)
        .from(tableName)
        .update(rowData)
        .eq('id', rowData.id);

      if (error) throw error;
      toast.success('Row updated successfully');
      setEditingRow(null);
      fetchTableData(tableName);
    } catch (error) {
      console.error('Error updating row:', error);
      toast.error('Failed to update row');
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
            <TabsList className={`grid w-full ${isOwner ? 'grid-cols-4' : 'grid-cols-2'} max-w-3xl`}>
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              {isOwner && <TabsTrigger value="notes">Page Notes</TabsTrigger>}
              {isOwner && <TabsTrigger value="database">Database</TabsTrigger>}
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

            {isOwner && (
              <TabsContent value="database" className="space-y-4">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-neon-cyan" />
                    Database Management
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1 space-y-2">
                      <h3 className="font-semibold mb-3">Tables</h3>
                      {tables.map((table) => (
                        <Button
                          key={table}
                          variant={selectedTable === table ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => fetchTableData(table)}
                        >
                          {table}
                        </Button>
                      ))}
                    </div>

                    <div className="lg:col-span-3">
                      {loadingTables ? (
                        <p className="text-muted-foreground">Loading...</p>
                      ) : selectedTable ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{selectedTable}</h3>
                            <span className="text-sm text-muted-foreground">
                              {tableData.length} rows
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <div className="max-h-[600px] overflow-y-auto">
                              {tableData.length === 0 ? (
                                <p className="text-muted-foreground">No data in this table</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead className="sticky top-0 bg-background border-b">
                                    <tr>
                                      {Object.keys(tableData[0]).map((key) => (
                                        <th key={key} className="text-left p-2 font-semibold">
                                          {key}
                                        </th>
                                      ))}
                                      <th className="text-left p-2 font-semibold">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tableData.map((row, idx) => (
                                      <tr key={idx} className="border-b hover:bg-muted/50">
                                        {Object.entries(row).map(([key, value]) => (
                                          <td key={key} className="p-2">
                                            {editingRow?.id === row.id ? (
                                              <Input
                                                value={editingRow[key] ?? ''}
                                                onChange={(e) =>
                                                  setEditingRow({
                                                    ...editingRow,
                                                    [key]: e.target.value,
                                                  })
                                                }
                                                className="text-xs"
                                              />
                                            ) : (
                                              <span className="break-all">
                                                {typeof value === 'object'
                                                  ? JSON.stringify(value)
                                                  : String(value ?? '')}
                                              </span>
                                            )}
                                          </td>
                                        ))}
                                        <td className="p-2">
                                          <div className="flex gap-2">
                                            {editingRow?.id === row.id ? (
                                              <>
                                                <Button
                                                  size="sm"
                                                  onClick={() =>
                                                    updateRow(selectedTable, editingRow)
                                                  }
                                                >
                                                  Save
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => setEditingRow(null)}
                                                >
                                                  Cancel
                                                </Button>
                                              </>
                                            ) : (
                                              <>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => setEditingRow(row)}
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() =>
                                                    deleteRow(selectedTable, row.id)
                                                  }
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Select a table to view its data</p>
                      )}
                    </div>
                  </div>
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
