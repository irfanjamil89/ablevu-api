import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// Install with:
// npm install axios
// npm install --save-dev @types/axios
import axios from 'axios';
import { use } from 'passport';
import { BusinessService } from 'src/business/business.service';
import { CreateBusinessDto } from 'src/business/create-business.dto';
import { User } from 'src/entity/user.entity';
import { UsersService } from 'src/services/user.service';
import { UserDto } from 'src/user/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SyncService {
    constructor(private readonly businessService: BusinessService,
        private readonly userService: UsersService
    ) { }
    private readonly apiUrl = 'https://ablevu.com/api/1.1/obj/business';
    private readonly userApiUrl = 'https://ablevu.com/api/1.1/obj/user';
    private readonly apiToken = '431b5448a8357d0cd7a9f6bf570650e3';

    async fetchBusinesses() {
        try {
            const response = await axios.get<any>(this.apiUrl, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                },
            });

            console.log(response.data);

            // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
            const data = response.data as any;
            const businesses: any[] = data?.response?.results ?? data?.response ?? [];

            for (const bubbleBusiness of businesses) {
                const business = new CreateBusinessDto();
                business.externla_id = bubbleBusiness._id;
                business.name = bubbleBusiness.description_text;
                business.website = bubbleBusiness.businesswebsite_text;
                business.city = bubbleBusiness.city_text;
                business.state = bubbleBusiness.state_text;
                business.zipcode = bubbleBusiness.zip_text;
                business.address = bubbleBusiness.address_geographic_address?.address;
                business.phone_number = bubbleBusiness.phonenumber_text;
                business.description = bubbleBusiness.longdescription_text;
                business.latitude = bubbleBusiness.address_geographic_address?.lat;
                business.longitude = bubbleBusiness.address_geographic_address?.lng;
                business.logo_url = bubbleBusiness.logo_image;
                business.status = bubbleBusiness.businessstatus__option_business_status_nature  ;
                business.creatorId = (await this.userService.findOneByExternalId(bubbleBusiness.creator_user))?.id;  //pull creator user id from postgres
               console.log('Syncing business:', business.name,business.creatorId);
                await this.businessService.createBusiness(business.creatorId || '', business);
            }

            return response.data; // Bubble returns { "response": { "results": [...] } } or { "response": [...] }
        } catch (error) {
            console.error('❌ Error fetching from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble data', HttpStatus.BAD_REQUEST);
        }
    }

    async syncUsers() {

        try {
            const response = await axios.get<any>(this.userApiUrl, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                },
            });

            const data = response.data as any;
            const bublleUsers: any[] = data?.response?.results ?? data?.response ?? [];
            for (const bubbleUser of bublleUsers) { 
                try{
                const passwordHash = await bcrypt.hash("StrongP@ssw0rd!", 12);
                const user = new User();
                user.external_id = bubbleUser._id;
                user.email = bubbleUser.authentication.email.email;
                user.first_name = bubbleUser.firstname_text;
                user.last_name = bubbleUser.lastname_text;
                user.archived = !bubbleUser.useractive_boolean;
                user.user_role = bubbleUser.userrole1_option_user_role0;
                user.created_at = new Date(bubbleUser['Created Date']);
                user.modified_at = new Date(bubbleUser['Modified Date']);
                user.consent = bubbleUser.user_signed_up || false;
                user.phone_number = bubbleUser.phone_number_text;
                user.paid_contributor = bubbleUser.paidcontributor_boolean || false;
                user.customer_id = bubbleUser.StripeCustomerID || null;
                user.profile_picture_url = bubbleUser.profilepicture_image || null;
                user.password = passwordHash;
                user.source = 'bubble';
                console.log('Syncing user:', user.email);
                console.log('Syncing user:', user.first_name);
                await this.userService.save(user);
                }
                catch (error) {
                    console.error('❌ Error syncing user from Bubble:', bubbleUser.authentication.email.email, (error as any).response?.data || error);
                }
            }
            console.log(response.data);

        }
        catch (error) {
            console.error('❌ Error fetching users from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble user data', HttpStatus.BAD_REQUEST);
        }
    }
}
