import { Injectable } from '@nestjs/common';
import { CreateXrplDto } from './dto/create-xrpl.dto';
import { UpdateXrplDto } from './dto/update-xrpl.dto';

@Injectable()
export class XrplService {
  create(createXrplDto: CreateXrplDto) {
    return 'This action adds a new xrpl';
  }

  findAll() {
    return `This action returns all xrpl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} xrpl`;
  }

  update(id: number, updateXrplDto: UpdateXrplDto) {
    return `This action updates a #${id} xrpl`;
  }

  remove(id: number) {
    return `This action removes a #${id} xrpl`;
  }
}
