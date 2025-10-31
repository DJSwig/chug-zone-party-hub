import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useCardBack() {
  const { user } = useAuth();
  const [cardBackUrl, setCardBackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCardBack();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCardBack = async () => {
    try {
      const { data } = await supabase
        .from('customizations')
        .select('card_back_url')
        .eq('user_id', user?.id)
        .single();

      if (data?.card_back_url && (data.card_back_url.startsWith('/') || /^https?:\/\//i.test(data.card_back_url))) {
        setCardBackUrl(data.card_back_url);
      } else {
        setCardBackUrl(null);
      }
    } catch (error) {
      console.error('Error fetching card back:', error);
    } finally {
      setLoading(false);
    }
  };

  return { cardBackUrl, loading };
}
