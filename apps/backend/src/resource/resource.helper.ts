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

	/**
	 * Récupère la balance XRPL de chaque utilisateur (acheteur et bénéficiaires).
	 *
	 * Pour chaque utilisateur, tente jusqu'à 3 fois (avec 1s d'attente entre chaque essai)
	 * si la balance est null ou undefined, afin de laisser le temps au réseau XRPL
	 * de valider la transaction et d'actualiser la balance après un paiement ou un mint.
	 *
	 * Cela garantit que les nouvelles balances sont bien récupérées pour tous les utilisateurs,
	 * même juste après une transaction XRPL.
	 *
	 * @param users Tableau d'utilisateurs (User)
	 * @returns Un objet { [userId]: balanceXRP }
	 */
	async getAllBalances(users: any[]) {
		const balances = {};
		for (const u of users) {
			if (!u || !u.id) continue;
			let tries = 0;
			let balance = null;
			while (tries < 3) {
				try {
					balance = await this.xrplService.getUserBalance(u);
					if (balance !== null && balance !== undefined) break;
				} catch {}
				tries++;
				if (tries < 3)
					await new Promise((res) => setTimeout(res, 1000));
			}
			balances[u.id] = balance;
		}
		return balances;
	}
}
