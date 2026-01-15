import { Body, Controller, UseGuards, Post, Patch, Param, Delete, Get, Query} from "@nestjs/common";
import { CreateCouponsDto } from "./create-coupons.dto";
import { UpdateCouponsDto } from "./update-coupons.dto";
import { CouponsService } from "./coupons.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('coupons')
export class CouponsController{
    constructor(
        private readonly couponsService: CouponsService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createCoupons (
        @UserSession() user: any,
        @Body() dto: CreateCouponsDto,
    ){
        await this.couponsService.createCoupons(user.id, dto);
        return {message: "Coupon Created Successfully"}
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    async updateCoupons(
        @Param('id') id: string,
        @UserSession() user: any,
        @Body() dto: UpdateCouponsDto,
    ){
        await this.couponsService.updateCoupons( id, user.id, dto);
        return {message: "Coupon Updated Successfully"}
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteCoupons(
        @Param('id') id: string,
        @UserSession() userId: any,
    ){
        await this.couponsService.deleteCoupons( id, userId);
        return {message: "Coupon Deleted Successfully"}
    }

    @Get('list')
    listPaginated(
        @Query('page') page=1,
        @Query('limit') limit=10,
        @Query('active') active: string,
    ){
        const activeBool = active === undefined ? undefined : active === 'true' ? true : false;
        
        return this.couponsService.listPaginated(
            Number(page),
            Number(limit),
            {
                active: activeBool,
            },
        );
    }

    @Get('coupon-profile/:id')
    async getCouponsProfile(
        @Param('id') id: string,
    ){
        return this.couponsService.getCouponsProfile(id);
    }
}