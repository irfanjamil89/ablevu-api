import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('syncbubble')
export class SyncbubbleController {
    constructor(private readonly bubbleService: SyncService) { }
    @Get('business')
    async getBusinesses() {
        return this.bubbleService.SyncBusinesses();
    }

    @Get('users')
    async getUseres() {
        return this.bubbleService.syncUsers();
    }

    @Get('af')
    async getAf() {
        return this.bubbleService.syncAF();
    }

    @Get('baf')
    async getBAf() {
        return this.bubbleService.SyncBusinessesAF();
    }

    @Get('vt')
    async getVT() {
        return this.bubbleService.SyncVirtualTour();
    }

    @Get('aiSync')
    async getAI() {
        return this.bubbleService.SyncAIChatbotDb();
    }
}
