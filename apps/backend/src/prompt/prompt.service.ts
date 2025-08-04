import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PromptService {
	constructor(
		@InjectRepository(Prompt)
		private promptRepository: Repository<Prompt>,
	) {}

	async create(
		createPromptDto: CreatePromptDto,
		userId: number,
	): Promise<Prompt> {
		const prompt = this.promptRepository.create({
			...createPromptDto,
			created_by: { id: userId } as User,
		});
		return this.promptRepository.save(prompt);
	}

	async findAll(): Promise<Prompt[]> {
		return this.promptRepository.find({
			relations: ['created_by'],
			order: { created_at: 'DESC' },
		});
	}

	async findPublic(): Promise<Prompt[]> {
		return this.promptRepository.find({
			where: { is_public: true },
			relations: ['created_by'],
			order: { created_at: 'DESC' },
		});
	}

	async findOne(id: number): Promise<Prompt> {
		return this.promptRepository.findOne({
			where: { id },
			relations: ['created_by'],
		});
	}

	async findByName(name: string): Promise<Prompt> {
		return this.promptRepository.findOne({
			where: { name },
			relations: ['created_by'],
		});
	}

	async update(
		id: number,
		updatePromptDto: UpdatePromptDto,
	): Promise<Prompt> {
		await this.promptRepository.update(id, updatePromptDto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.promptRepository.delete(id);
	}
}
