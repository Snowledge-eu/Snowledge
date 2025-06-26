import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MyNftCommand {
	private readonly logger = new Logger(MyNftCommand.name);

	constructor(private readonly userService: UserService) {}

	get data() {
		return new SlashCommandBuilder()
			.setName('mynft')
			.setDescription("Affiche votre NFT d'identité Snowledge.");
	}

	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply({ ephemeral: true });

			const member = interaction.member as GuildMember;
			if (
				!member.roles.cache.some(
					(r) => r.name === 'Snowledge Authenticated',
				)
			) {
				await interaction.editReply({
					content:
						'Vous devez avoir le rôle "Snowledge Authenticated" pour utiliser cette commande.',
				});
				return;
			}

			const user = await this.userService.findOneByDiscordId(
				interaction.user.id,
			);

			if (!user || !user.nftId) {
				await interaction.editReply({
					content:
						"Nous n'avons pas trouvé de NFT associé à votre compte. Avez-vous bien lié votre compte Discord à la plateforme ?",
				});
				return;
			}

			const embed = new EmbedBuilder()
				.setTitle('🎨 Votre NFT Snowledge')
				.setDescription(`**ID NFT:** \`${user.nftId}\``)
				.addFields([
					{
						name: '🌐 Blockchain',
						value: 'XRPL (XRP Ledger)',
						inline: true,
					},
					{
						name: '👤 Propriétaire',
						value: user.email || 'Non spécifié',
						inline: true,
					},
					{
						name: '🔗 Explorer',
						value: `[Voir sur XRPL](https://livenet.xrpl.org/nft/${user.nftId})`,
						inline: false,
					},
				])
				.setColor('#1f8b4c')
				.setThumbnail(interaction.user.displayAvatarURL())
				.setFooter({
					text: 'Snowledge Identity NFT • XRPL',
					iconURL: interaction.client.user?.displayAvatarURL(),
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			this.logger.error('Error executing mynft command:', error);
			await interaction.editReply({
				content:
					'Une erreur est survenue lors de la récupération de votre NFT.',
			});
		}
	}
}
