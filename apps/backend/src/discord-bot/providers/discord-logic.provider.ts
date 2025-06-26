import { Injectable, Logger } from '@nestjs/common';
import { MessageReaction, User, TextChannel, Guild } from 'discord.js';
import { CommunityService } from 'src/community/community.service';
import { ProposalProvider } from 'src/proposal/proposal.provider';
import { VoteProvider } from 'src/vote/vote.provider';
import { EmbedBuilder } from 'discord.js';
import type { Proposal } from 'src/proposal/entities/proposal.entity';
import { DiscordServerService } from 'src/discord-server/discord-server.service';
import { DiscordClientService } from '../services/discord-client.service';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

@Injectable()
export class DiscordLogicProvider {
	private readonly logger = new Logger(DiscordLogicProvider.name);

	constructor(
		private readonly communityService: CommunityService,
		private readonly voteProvider: VoteProvider,
		private readonly proposalProvider: ProposalProvider,
		private readonly discordServerService: DiscordServerService,
		private readonly discordClientService: DiscordClientService,
	) {}

	async handleGuildCreate(guild: Guild) {
		try {
			const client = this.discordClientService.getClient();
			this.logger.log(
				`[DEBUG] GuildCreate received for ${guild.name} (${guild.id})`,
			);

			let discordServer = await this.discordServerService.findOne(
				guild.id,
			);

			// --- Authentication role management ---
			let role: any = null;
			if (discordServer?.authRoleId) {
				role = guild.roles.cache.get(discordServer.authRoleId);
			}
			if (!role) {
				role = await guild.roles.create({
					name: 'Snowledge Authenticated',
					color: 'Blue',
					mentionable: true,
					permissions: [],
				});
				await this.discordServerService.update(guild.id, {
					authRoleId: role.id,
				});
			}

			// --- Authentication channel management ---
			let channel: any = null;
			if (discordServer?.authChannelId) {
				channel = guild.channels.cache.get(discordServer.authChannelId);
			}
			if (!channel) {
				channel = await guild.channels.create({
					name: 'snowledge-tos-validation',
					type: 0, // GUILD_TEXT
					topic: 'Channel to validate TOS and authorize Snowledge',
					permissionOverwrites: [
						{
							id: guild.roles.everyone.id,
							allow: ['ViewChannel'],
							deny: ['SendMessages'],
						},
						{
							id: role.id,
							deny: ['ViewChannel'],
						},
						{
							id: client.user.id,
							allow: ['ViewChannel', 'SendMessages'],
						},
					],
				});
				await this.discordServerService.update(guild.id, {
					authChannelId: channel.id,
				});
			}

			// Dynamic generation of OAuth2 URL
			const params = new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID,
				redirect_uri: `${process.env.BACK_URL}/discord-bot/link`,
				response_type: 'code',
				scope: 'identify email',
				prompt: 'consent',
				state: guild.id,
			});
			const oauthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;

			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel('🔐 Authorize Snowledge')
					.setStyle(ButtonStyle.Link)
					.setURL(oauthUrl),
			);

			const message = await channel.send({
				content: `# 🔐 **Snowledge Authorization**

**To access all Snowledge features, you need to authorize the connection to your Discord account.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 **Step-by-Step Process:**

### **🎯 Method 1: Direct Authorization (Recommended)**
1. **Click the button below** → "Authorize Snowledge"
2. **Grant permissions** on the Discord authorization page
3. **You'll be redirected** to a confirmation page
4. **Return to Discord** → You'll automatically receive the **Snowledge Authenticated** role

### **⚠️ Method 2: If Method 1 Doesn't Work**
*If the button opens Discord's internal browser or you don't reach the confirmation page:*

1. **Right-click the button below** → **"Copy Link"**
2. **Open your web browser** (Chrome, Firefox, Safari)
3. **Paste the link** in the address bar and press Enter
4. **Complete the authorization** in your browser
5. **Return to Discord** → You'll receive your role

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ **What Happens After Authorization:**
- ✅ You get the **Snowledge Authenticated** role
- ✅ Access to exclusive Snowledge features  
- ✅ Ability to participate in community voting
- ✅ Full integration with the Snowledge platform
- ✅ **NFT minted on XRPL blockchain** (check with \`/mynft\`)

## 🆘 **Need Help?**
If you encounter any issues, contact an administrator for assistance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*💡 Why these methods? Discord's internal browser can sometimes interfere with OAuth authorization. Using an external browser ensures a smooth experience.*`,
				components: [row],
			});
			await message.pin();
		} catch (e) {
			this.logger.error(
				`Error creating role, channel, or sending message on server ${guild.name}`,
				e,
			);
		}
	}

	async handleMessageReactionAdd(reaction: MessageReaction, user: User) {
		if (user.bot) return;

		const community = await this.communityService.findOneByDiscordServerId(
			reaction.message.guild.id,
		);

		if (!community) return;

		const voteChannelId = community.discordServer?.voteChannelId;
		if (reaction.message.channel.id !== voteChannelId) return;

		try {
			const isProposalMessage =
				reaction.message.embeds.length > 0 &&
				reaction.message.embeds[0].title?.startsWith(
					'📢 New idea proposed by',
				);
			if (!isProposalMessage) return;

			const proposalWithVotes =
				await this.voteProvider.handleReactionVote(reaction, user);

			if (!proposalWithVotes) return;

			const updatedProposal =
				await this.proposalProvider.updateProposalStatus(
					proposalWithVotes,
				);

			const channel = reaction.message.channel as TextChannel;
			const message = await channel.messages.fetch(reaction.message.id);

			if (updatedProposal.status === 'in_progress') {
				const updatedEmbed = this.createProposalEmbed(updatedProposal);
				await message.edit({ embeds: [updatedEmbed] });
			} else {
				const resultEmbed =
					this.createProposalResultEmbed(updatedProposal);
				await message.edit({ embeds: [resultEmbed], components: [] });

				const resultsChannelId =
					community.discordServer?.resultChannelId;
				if (resultsChannelId) {
					const resultsChannel = (await channel.guild.channels.fetch(
						resultsChannelId,
					)) as TextChannel;
					if (resultsChannel) {
						await resultsChannel.send({ embeds: [resultEmbed] });
					}
				}
			}
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}

	createProposalEmbed(proposal: Proposal): EmbedBuilder {
		const yesVotes = proposal.votes.filter(
			(v) => v.choice === 'for',
		).length;
		const noVotes = proposal.votes.filter(
			(v) => v.choice === 'against',
		).length;
		const yesFormatVotes = proposal.votes.filter(
			(v) => v.formatChoice === 'for',
		).length;
		const noFormatVotes = proposal.votes.filter(
			(v) => v.formatChoice === 'against',
		).length;
		const totalVoters = proposal.votes.length;
		const quorum = proposal.quorum.required;

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`📢 New idea proposed by ${proposal.submitter.firstname}`)
			.setDescription(
				`**Subject:** ${proposal.title}\n\n> ${proposal.description}`,
			)
			.addFields(
				{
					name: 'Proposed Format',
					value: proposal.format,
					inline: true,
				},
				{
					name: 'Potential Contributor',
					value: proposal.isContributor ? 'Yes' : 'No',
					inline: true,
				},
				{
					name: 'Vote ends',
					value: `<t:${Math.floor(
						proposal.deadline.getTime() / 1000,
					)}:R>`,
					inline: true,
				},
				{
					name: `Votes on subject (${totalVoters}/${quorum})`,
					value: `✅ For: ${yesVotes}\n❌ Against: ${noVotes}`,
					inline: true,
				},
				{
					name: 'Votes on format',
					value: `👍 For: ${yesFormatVotes}\n👎 Against: ${noFormatVotes}`,
					inline: true,
				},
			)
			.setFooter({
				text: 'React to vote!',
			});

		return embed;
	}

	private createProposalResultEmbed(proposal: Proposal): EmbedBuilder {
		const statusIcon = proposal.status === 'accepted' ? '✅' : '❌';
		const statusText =
			proposal.status === 'accepted' ? 'Accepted' : 'Rejected';
		const color = proposal.status === 'accepted' ? '#2ECC71' : '#E74C3C';

		let formatResult = proposal.format;
		if (
			proposal.status === 'accepted' &&
			proposal.format === 'toBeDefined'
		) {
			formatResult = 'To be redefined (initial format rejected)';
		}

		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(`${statusIcon} Proposal ${statusText}`)
			.setDescription(`**Subject:** ${proposal.title}`)
			.addFields({ name: 'Final Format', value: formatResult });

		return embed;
	}
}
