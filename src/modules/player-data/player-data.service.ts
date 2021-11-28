import { Injectable } from '@nestjs/common';
import { CreatePlayerDataDto } from './dto/create-player-data.dto';
import { UpdatePlayerDataDto } from './dto/update-player-data.dto';

@Injectable()
export class PlayerDataService {
  create(createPlayerDatumDto: CreatePlayerDataDto) {
    return 'This action adds a new playerDatum';
  }

  findAll() {
    return `This action returns all playerData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playerDatum`;
  }

  update(id: number, updatePlayerDatumDto: UpdatePlayerDataDto) {
    return `This action updates a #${id} playerDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} playerDatum`;
  }
}
