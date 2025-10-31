import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_CLIENT_ID = '1417340459386409030';
const DISCORD_REDIRECT_URI = 'https://chugzone.com/auth/discord/callback';
const CHUGZONE_SERVER_ID = '1415472087891705856';
const OWNER_DISCORD_ID = '954112814379839548';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code } = await req.json();

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: Deno.env.get('DISCORD_CLIENT_SECRET') ?? '',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = await userResponse.json();

    // Get user's guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const guilds = await guildsResponse.json();
    const isServerMember = guilds.some((guild: any) => guild.id === CHUGZONE_SERVER_ID);

    // Create or get Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${discordUser.id}@discord.temp`,
      email_confirm: true,
      user_metadata: {
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        discord_avatar: discordUser.avatar,
      },
    });

    if (authError && !authError.message.includes('already exists')) {
      throw authError;
    }

    // Get the user ID (either from creation or existing user)
    let userId = authData?.user?.id;
    if (!userId) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('discord_id', discordUser.id)
        .single();
      userId = existingUser?.id;
    }

    // Update or create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        discord_avatar: discordUser.avatar,
        discord_guilds: guilds,
        is_server_member: isServerMember,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Check if user is owner and assign admin role
    if (discordUser.id === OWNER_DISCORD_ID) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin',
        }, {
          onConflict: 'user_id,role',
        });

      if (roleError) {
        console.error('Role error:', roleError);
      }
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `${discordUser.id}@discord.temp`,
    });

    if (sessionError) {
      throw sessionError;
    }

    return new Response(
      JSON.stringify({
        session: sessionData,
        user: discordUser,
        isServerMember,
        isAdmin: discordUser.id === OWNER_DISCORD_ID,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Discord auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
