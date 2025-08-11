import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSnowTestRegisterDto } from './dto/create-snow-test-register.dto';
import { UpdateSnowTestRegisterDto } from './dto/update-snow-test-register.dto';
import { SnowTestRegister } from './entities/snow-test-register.entity';

@Injectable()
export class SnowTestRegisterService {
  constructor(
    @InjectRepository(SnowTestRegister)
    private readonly registerRepository: Repository<SnowTestRegister>
  ) {}

  async create(createSnowTestRegisterDto: CreateSnowTestRegisterDto): Promise<SnowTestRegister> {
    const saved = await this.registerRepository.create(createSnowTestRegisterDto);
		return this.registerRepository.save(saved);
  }

  findAll() {
    return `This action returns all snowTestRegister`;
  }

  findOne(id: number) {
    return `This action returns a #${id} snowTestRegister`;
  }

  update(id: number, updateSnowTestRegisterDto: UpdateSnowTestRegisterDto) {
    return `This action updates a #${id} snowTestRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} snowTestRegister`;
  }
}
