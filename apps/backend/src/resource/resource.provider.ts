import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceHelper } from './resource.helper';
import { XrplService } from '../xrpl/xrpl.service';
import { User } from '../user/entities/user.entity';
import { BuyResourceDto } from './dto/buy-resource.dto';

@Injectable()
export class ResourceProvider {
	constructor(
		private readonly resourceService: ResourceService,
		private readonly resourceHelper: ResourceHelper,
		private readonly xrplService: XrplService,
	) {}

	async buyResource(
		resourceId: string,
		buyer: User,
		buyResourceDto: BuyResourceDto,
	) {
		try {
			console.log('[ResourceProvider] Début achat ressource', {
				resourceId,
				buyerId: buyer.id,
			});
			// 1. Récupérer la ressource (mock pour l'instant)
			const resource =
				await this.resourceService.getResourceById(resourceId);
			if (!resource) {
				console.error('[ResourceProvider] Ressource introuvable', {
					resourceId,
				});
				throw new NotFoundException('Resource not found');
			}
			// console.log('[ResourceProvider] Ressource récupérée', { resource });

			// 2. Vérifier la balance de l'utilisateur
			const buyerBalance = await this.xrplService.getUserBalance(buyer);
			console.log('[ResourceProvider] Balance acheteur', {
				buyerBalance,
			});
			const priceXRP = Number(resource.price) / 10; //TODO: change to actual price in XRP or use a constant
			if (!buyerBalance || Number(buyerBalance) < priceXRP) {
				console.error('[ResourceProvider] Solde insuffisant', {
					buyerBalance,
					price: resource.price,
				});
				throw new BadRequestException('Solde insuffisant');
			}

			// 3. Calculer la distribution (créateur, contributeurs)
			const distribution =
				await this.resourceHelper.calculateDistribution(
					resource,
					priceXRP,
				);
			console.log('[ResourceProvider] Distribution calculée', {
				distribution,
			});

			// 4. Effectuer les paiements XRPL (un paiement par bénéficiaire)
			const txResults = [];
			for (const dist of distribution) {
				try {
					console.log('[ResourceProvider] Paiement XRPL', {
						to: dist.address,
						amount: dist.amount,
					});
					const result = await this.xrplService.sendPaymentFromUser(
						buyer,
						dist.address,
						dist.amount,
					);
					txResults.push({
						to: dist.address,
						amount: dist.amount,
						tx: result,
					});
					console.log('[ResourceProvider] Paiement réussi', {
						to: dist.address,
						result,
					});
				} catch (err) {
					const error = err as Error;
					console.error('[ResourceProvider] Erreur paiement XRPL', {
						to: dist.address,
						error,
					});
					throw new BadRequestException(
						'Erreur lors du paiement XRPL: ' + error.message,
					);
				}
			}

			// 4bis. Mint NFT d'accès à la ressource pour l'acheteur
			let nftMintResult = null;
			try {
				nftMintResult = await this.xrplService.mintNftForResource(
					buyer,
					resourceId,
				);
				console.log(
					'[ResourceProvider] NFT minté et transféré pour accès ressource',
					{ nftMintResult },
				);
			} catch (err) {
				console.error(
					'[ResourceProvider] Erreur mint/transfert NFT accès ressource',
					{ error: err },
				);
				// On n'empêche pas l'achat, mais on logue l'erreur
			}

			// 5. Récupérer les nouvelles balances
			let balances = {};
			try {
				balances = await this.resourceHelper.getAllBalances([
					buyer,
					...distribution.map((d) => d.user),
				]);
				console.log('[ResourceProvider] Balances récupérées', {
					balances,
				});
			} catch (err) {
				console.error(
					'[ResourceProvider] Erreur récupération balances',
					{ error: err },
				);
			}

			console.log('[ResourceProvider] Achat terminé', {
				resourceId,
				txResults,
				balances,
				nftMintResult,
			});
			return {
				resourceId,
				txResults,
				balances,
				nftMintResult,
			};
		} catch (error) {
			console.error('[ResourceProvider] Erreur globale achat', { error });
			throw error;
		}
	}

	async getResourceBalances(resourceId: string, buyer: User) {
		try {
			const resource =
				await this.resourceService.getResourceById(resourceId);
			if (!resource) throw new NotFoundException('Resource not found');
			const distribution =
				await this.resourceHelper.calculateDistribution(
					resource,
					Number(resource.price) / 10,
				);
			// Récupère la balance de l'acheteur et de chaque bénéficiaire
			const users = [buyer, ...distribution.map((d) => d.user)];
			const balances = await this.resourceHelper.getAllBalances(users);
			// Ajoute une clé buyer pour la balance de l'utilisateur courant
			balances['buyer'] = balances[buyer.id];
			return balances;
		} catch (error) {
			console.error('[ResourceProvider] Erreur getResourceBalances', {
				error,
			});
			throw error;
		}
	}

	// Méthode utilitaire publique pour le controller
	async getResourceById(resourceId: string) {
		return this.resourceService.getResourceById(resourceId);
	}
}
