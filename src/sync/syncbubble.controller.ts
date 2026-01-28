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

    @Get('ac')
    async getAC() {
        return this.bubbleService.SyncAC();
    }

    @Get('bam')
    async getBAM() {
        return this.bubbleService.SyncBusinessesAM();
    }

    @Get('baq')
    async getBAQ() {
        return this.bubbleService.SyncBusinessesAQ();
    }

    @Get('bar')
    async getBAR() {
        return this.bubbleService.SyncBusinessesAR();
    }

    @Get('bat')
    async getBAT() {
        return this.bubbleService.SyncBusinessesAT();
    }

    @Get('bcsm')
    async getBCSM() {
        return this.bubbleService.SyncBusinessesCSM();
    }

    @Get('bcs')
    async getBCS() {
        return this.bubbleService.SyncBusinessesCS();
    }

    @Get('bi')
    async getBI() {
        return this.bubbleService.SyncBusinessesImages();
    }

    @Get('p')
    async getP() {
        return this.bubbleService.SyncPartners();
    }

    @Get('bp')
    async getBP() {
        return this.bubbleService.SyncBusinessPartners();
    }

    @Get('br')
    async getBR() {
        return this.bubbleService.SyncBusinessRecommendations();
    }

    @Get('bs')
    async getBS() {
        return this.bubbleService.SyncBusinessSchedule();
    }
    @Get('f')
    async getF() {
        return this.bubbleService.SyncFeedback();
    }

    @Get('breviews')
    async getBReviews() {
        return this.bubbleService.SyncBusinessReviews();
    }

    @Get('coupons')
    async getCoupons() {
        return this.bubbleService.SyncCoupons();
    }
    @Get('subscription')
    async getSubscription() {
        return this.bubbleService.SyncSubscriptions();
    }

    @Get('aiSync')
    async getAI() {
        return this.bubbleService.SyncAIChatbotDb();
    }
}
