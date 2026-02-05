import { Body, Controller, Patch, Post, Param, Delete, Get, Query, UseGuards, ForbiddenException } from "@nestjs/common";
import { CreateBusinessDto } from "./create-business.dto";
import { UpdateBusinessDto } from "./update-business.dto";
import { BusinessService } from "./business.service";
import { UserSession } from "src/auth/user.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BusinessStatusDto } from "./business-status.dto";
import { UserType } from "src/user/user-type.enum";

@Controller('business')
export class BusinessController {
    constructor( private businessService: BusinessService ) {}

@Post('create')
@UseGuards(JwtAuthGuard)
async createBusiness(@UserSession() user: any, @Body() dto: CreateBusinessDto) {
  const userRole =
    (user?.user_role || user?.type || user?.role || user?.userType || user?.user_type) as UserType;

  // ✅ only Admin/Contributor can create directly
  if (userRole === UserType.Admin || userRole === UserType.Contributor) {

    // ✅ FORCE status based on role (ignore what frontend sends)
    const fixedDto: any = {
      ...dto,
      business_status: userRole === UserType.Contributor ? 'Pending Review' : 'draft',
      active: userRole === UserType.Admin, // optional: admin can be active true
    };

    const createdBusiness = await this.businessService.createBusiness(user.id, fixedDto);

    return {
      message: 'Business created successfully',
      id: createdBusiness.id,
      bypassedSubscription: true,
      userRole,
    };
  }

  throw new ForbiddenException(
    'Business users must purchase subscription via checkout before creating a business',
  );
}



@Patch('update/:id')
@UseGuards(JwtAuthGuard)
  async updateBusiness(
    @Param('id') Id: string, 
    @UserSession() user : any,
    @Body() dto: UpdateBusinessDto, 
  ) {
    await this.businessService.updateBusiness(Id, user.id, dto);
    return { message: 'Business updated successfully' };
}

@Delete('delete/:id')
@UseGuards(JwtAuthGuard)
async deleteBusiness(
    @Param('id') id: string,
    @UserSession() user : any){
    await this.businessService.deleteBusiness(id, user.id);
    return{ message: 'Business deleted successfully'}
  }

@Get('list')
@UseGuards(JwtAuthGuard)
async listPaginated(
  @UserSession() user: any,
  @Query('page') page = 1,
  @Query('limit') limit = 10,

  @Query('search') search?: string,
  @Query('city') city?: string,
  @Query('country') country?: string,
  @Query('active') active?: string,
  @Query('businessTypeId') businessTypeId?: string,

  // ✅ NEW
  @Query('business_status') business_status?: string,
  @Query('sort_by') sort_by?: string,
  @Query('sort_order') sort_order?: 'ASC' | 'DESC',
) {
  const activeBool =
    active === undefined ? undefined : active === 'true' ? true : false;

  return this.businessService.listPaginated(
    Number(page),
    Number(limit),
    {
  search, city, country, active: activeBool, businessTypeId,
  business_status,
  sort_by: sort_by as any,
  sort_order,
},
    user,
  );
}


@Get('list1')
async list1Paginated(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('search') search?: string,           
  @Query('businessTypeIds') businessTypeIds?: string,
  @Query('featureIds') featureIds?: string,   
  @Query('city') city?: string,
  @Query('country') country?: string,
) {
  return this.businessService.list1Paginated({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search,
    businessTypeIds,
    featureIds,
    city,
    country,
  });
}

@Patch('status/:id')
@UseGuards(JwtAuthGuard)
async updateBusinessStatus(
    @Param('id') id: string,
    @Body() dto: BusinessStatusDto,
    @UserSession() user: any,
){
    await this.businessService.updateBusinessStatus(id, dto, user.id);
    return { message: 'Business status updated successfully' };
  }


@Get('business-profile/:id')          
  async getBusinessProfile(
    @Param('id') id: string,    
  ) {
    return this.businessService.getBusinessProfile(id);
  }
  
}