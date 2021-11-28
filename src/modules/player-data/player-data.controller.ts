import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePlayerDataDto } from './dto/create-player-data.dto';
import { UpdatePlayerDataDto } from './dto/update-player-data.dto';
import { PlayerDataService } from './player-data.service';

@Controller('player-data')
export class PlayerDataController {
  constructor(private readonly playerDataService: PlayerDataService) {}

  @Post()
  create(@Body() createPlayerDatumDto: CreatePlayerDataDto) {
    return this.playerDataService.create(createPlayerDatumDto);
  }

  @Get()
  findAll() {
    return this.playerDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playerDataService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlayerDatumDto: UpdatePlayerDataDto,
  ) {
    return this.playerDataService.update(+id, updatePlayerDatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playerDataService.remove(+id);
  }
}
