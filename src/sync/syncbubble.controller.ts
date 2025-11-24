import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('syncbubble')
export class SyncbubbleController {
    constructor(private readonly bubbleService: SyncService) { }
    @Get('business')
    async getBusinesses() {
        return this.bubbleService.fetchBusinesses();
    }

    @Get('users')
    async getUseres() {
        return this.bubbleService.syncUsers();
    }
}
