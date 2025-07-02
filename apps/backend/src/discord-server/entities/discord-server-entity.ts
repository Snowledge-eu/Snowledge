import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Community } from '../../community/entities/community.entity';

@Entity()
export class DiscordServer {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	guildId: string; // Identifiant du serveur Discord (guild) -- PRIMARY KEY

	@Column({ type: 'varchar', length: 100, nullable: true })
	guildName?: string; // Nom du serveur Discord (guild)

	@Column({ type: 'varchar', length: 32, nullable: true })
	proposeChannelId?: string; // Channel propositions

	@Column({ type: 'varchar', length: 32, nullable: true })
	voteChannelId?: string; // Channel votes

	@Column({ type: 'varchar', length: 32, nullable: true })
	resultChannelId?: string; // Channel résultats

	@Column({ type: 'varchar', length: 32, nullable: true })
	authRoleId?: string; // ID du rôle d'authentification Discord

	@Column({ type: 'varchar', length: 32, nullable: true })
	authChannelId?: string; // ID du salon d'authentification Discord

	@OneToOne(() => Community, (community) => community.discordServer, {
		onDelete: 'CASCADE',
	})
	community: Community;
	// @JoinColumn() // DiscordServer porte la clé étrangère communityId
}
