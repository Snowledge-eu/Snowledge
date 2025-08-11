import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { PromptProvider } from './prompt.provider';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { User } from '../user/entities/user.entity';

@Controller('admin/prompts')
@UseGuards(AuthGuard, AdminGuard)
export class PromptController {
	constructor(private readonly promptProvider: PromptProvider) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(
		@Body() createPromptDto: CreatePromptDto,
		@Request() req: any,
	) {
		const user = req.user as User;
		return this.promptProvider.createPrompt(createPromptDto, user);
	}

	@Get()
	async findAll(@Request() req: any) {
		const user = req.user as User;
		return this.promptProvider.getAllPrompts(user);
	}

	@Get(':id')
	async findOne(@Param('id') id: string, @Request() req: any) {
		const user = req.user as User;
		return this.promptProvider.getPrompt(+id, user);
	}

	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() updatePromptDto: UpdatePromptDto,
		@Request() req: any,
	) {
		const user = req.user as User;
		return this.promptProvider.updatePrompt(+id, updatePromptDto, user);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param('id') id: string, @Request() req: any) {
		const user = req.user as User;
		await this.promptProvider.deletePrompt(+id, user);
	}
}

// ============
// ENDPOINTS PUBLICS POUR LES UTILISATEURS NORMAUX
// ============
@Controller('user/prompts')
@UseGuards(AuthGuard)
export class UserPromptController {
	constructor(private readonly promptProvider: PromptProvider) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createUserPrompt(
		@Body() createPromptDto: CreatePromptDto,
		@Request() req: any,
	) {
		const user = req.user as User;
		return this.promptProvider.createUserPrompt(createPromptDto, user);
	}

	@Get(':userId')
	async findUserPromptsByUserId(@Param('userId') userId: string) {
		const prompts = await this.promptProvider.getUserPrompts(+userId);

		console.log(
			'DEBUG UserPromptController - Prompts found:',
			prompts.length,
		);
		console.log(
			'DEBUG UserPromptController - Prompts:',
			prompts.map((p) => ({
				name: p.name,
				is_public: p.is_public,
				created_by_id: p.created_by?.id,
			})),
		);

		// Retourner les prompts avec les propriétés nécessaires pour le frontend
		return prompts.map((prompt) => ({
			name: prompt.name,
			description: prompt.description,
			platform: prompt.platform,
			temperature: prompt.temperature,
			top_p: prompt.top_p,
			created_by_id: prompt.created_by?.id,
			is_public: prompt.is_public,
			// Indique si c'est le prompt de l'utilisateur connecté
			is_own: prompt.created_by?.id === +userId,
		}));
	}

	@Get('public')
	async findPublicPrompts() {
		return this.promptProvider.getPublicPrompts();
	}

	@Get(':id')
	async findUserPrompt(@Param('id') id: string, @Request() req: any) {
		const user = req.user as User;
		return this.promptProvider.getUserPrompt(+id, user);
	}

	@Patch(':id')
	async updateUserPrompt(
		@Param('id') id: string,
		@Body() updatePromptDto: UpdatePromptDto,
		@Request() req: any,
	) {
		const user = req.user as User;
		return this.promptProvider.updateUserPrompt(+id, updatePromptDto, user);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async removeUserPrompt(@Param('id') id: string, @Request() req: any) {
		const user = req.user as User;
		await this.promptProvider.deleteUserPrompt(+id, user);
	}
}
