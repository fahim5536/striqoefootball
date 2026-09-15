import { PrismaClient } from "@prisma/client";
import { getPrisma } from "./services";

const prisma = getPrisma();

export class DiscordIntegrationService {
  private static async getSettings() {
    return prisma.settings.findUnique({ where: { id: 'global' } });
  }

  static async sendNotification(channelId: string, message: any) {
    const settings = await this.getSettings();
    if (!settings?.discordIntegration || !settings?.discordBotToken) return;

    try {
      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${settings.discordBotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error('Discord notification failed:', err);
    }
  }

  static async getTokens(code: string, redirectUri: string) {
    const settings = await this.getSettings();
    if (!settings?.discordClientId || !settings?.discordClientSecret) {
       throw new Error("Discord OAuth is not configured.");
    }
    const params = new URLSearchParams({
      client_id: settings.discordClientId,
      client_secret: settings.discordClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });
    
    const res = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    
    if (!res.ok) {
       const text = await res.text();
       throw new Error(`Discord token exchange failed: ${text}`);
    }
    return res.json();
  }

  static async getUserProfile(accessToken: string) {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
       headers: {
         'Authorization': `Bearer ${accessToken}`
       }
    });
    if (!res.ok) throw new Error("Failed to fetch Discord profile.");
    return res.json();
  }
}
