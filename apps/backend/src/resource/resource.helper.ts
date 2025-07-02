import { Injectable } from '@nestjs/common';
import { XrplService } from '../xrpl/xrpl.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ResourceHelper {
	constructor(
		private readonly xrplService: XrplService,
		private readonly userService: UserService,
	) {}

	async calculateDistribution(resource: any, priceXRP: number) {
		// Retourne un tableau [{address, amount, user}]
		const distribution = [];
		// Créateur
		if (resource.contributors && resource.contributors.length > 0) {
			// On considère le premier contributeur comme créateur (à adapter si besoin)
			const creator = resource.creator;
			const creatorUser = await this.userService.findOneById(
				Number(creator.userId),
			);
			const creatorAddress =
				creatorUser && creatorUser.seed
					? this.xrplService.getAddressFromUser(creatorUser)
					: null;
			distribution.push({
				address: creatorAddress,
				amount: (priceXRP * resource.creatorSharePct) / 100,
				user: creatorUser,
				label: 'Creator',
				pct: resource.creatorSharePct,
			});
		}
		// Contributeurs
		if (resource.contributors) {
			for (const c of resource.contributors) {
				const contribUser = await this.userService.findOneById(
					Number(c.userId),
				);
				const contribAddress =
					contribUser && contribUser.seed
						? this.xrplService.getAddressFromUser(contribUser)
						: null;
				distribution.push({
					address: contribAddress,
					amount: (priceXRP * c.sharePct) / 100,
					user: contribUser,
					label: 'Contributor',
					pct: c.sharePct,
				});
			}
		}
		return distribution;
	}

	async getAllBalances(users: any[]) {
		const balances = {};
		for (const u of users) {
			if (!u || !u.id) continue;
			try {
				balances[u.id] = await this.xrplService.getUserBalance(u);
			} catch {
				balances[u.id] = null;
			}
		}
		return balances;
	}
}
