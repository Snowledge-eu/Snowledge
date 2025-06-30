export interface DiscordHarvestJob {
	
	_id: string;

	discordId: string;

	serverId: string;

	channels: string[];

	after?: string;

	before?: string;

	status: HarvestJobStatus ;
	finished_at?: Date;
	inserted?: number;
	error?: string;

	created_at: Date;
	updated_at: Date;

}

enum HarvestJobStatus {pending, running, completed, failed}