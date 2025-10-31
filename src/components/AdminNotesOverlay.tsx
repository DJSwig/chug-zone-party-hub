import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StickyNote, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Note {
  id: string;
  content: string;
  admin_id: string;
  created_at: string;
}

export function AdminNotesOverlay() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchNotes();
    }
  }, [isAdmin, isOpen, location.pathname]);

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('page_notes')
        .select('*')
        .eq('page_path', location.pathname)
        .order('created_at', { ascending: false });

      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('page_notes')
        .insert({
          page_path: location.pathname,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          content: newNote,
        });

      if (error) throw error;

      setNewNote('');
      fetchNotes();
      toast.success('Note added');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('page_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      fetchNotes();
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-glow"
        size="icon"
      >
        <StickyNote className="w-6 h-6" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 p-4 bg-card/95 backdrop-blur-sm border-primary/20 shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Admin Notes</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-background/50 border border-primary/10"
              >
                <p className="text-sm mb-2">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="h-6 px-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note for this page..."
              className="min-h-[80px]"
            />
            <Button
              onClick={addNote}
              disabled={loading || !newNote.trim()}
              className="w-full"
              size="sm"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
