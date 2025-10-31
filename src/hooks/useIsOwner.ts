import { useAuth } from './useAuth';

const OWNER_DISCORD_ID = '954112814379839548';

export function useIsOwner() {
  const { profile } = useAuth();
  return profile?.discord_id === OWNER_DISCORD_ID;
}
