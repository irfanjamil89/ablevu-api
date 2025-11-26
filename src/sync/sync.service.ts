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
import { BusinessTypeService } from 'src/business-type/business-type.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLinkedType } from 'src/entity/business_linked_type.entity';
import { Repository } from 'typeorm';
import { AccessibleFeatureType } from 'src/entity/accessible feature-type.entity';
import { AccessibleFeatureService } from 'src/accessible feature/accessible feature.service';
import { AccessibleFeatureDto } from 'src/accessible feature/accessible feature.dto';
@Injectable()
export class SyncService {
    constructor(private readonly businessService: BusinessService,
        private readonly userService: UsersService,
        private readonly businessTypeService: BusinessTypeService,
        private readonly accessibleFeatureTypeService: AccessibleFeatureService,
        @InjectRepository(BusinessLinkedType)
        private readonly linkedrepo: Repository<BusinessLinkedType>,
        @InjectRepository(AccessibleFeatureType)
        private accessibleFeatureTypeRepo: Repository<AccessibleFeatureType>
    ) { }
    private readonly apiUrl = 'https://ablevu.com/api/1.1/obj/business';
    private readonly userApiUrl = 'https://ablevu.com/api/1.1/obj/user';
    private readonly accessiblefeatureApiUrl = 'https://ablevu.com/api/1.1/obj/accessiblefeature';
    private readonly apiToken = '431b5448a8357d0cd7a9f6bf570650e3';

    async fetchBusinesses() {
        try {
            const response = await axios.get<any>(this.apiUrl, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                },
            });

            console.log(response.data);
            let businessTypes = await this.businessTypeService.listPaginated(1, 1000);

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
                business.status = bubbleBusiness.businessstatus__option_business_status_nature;
                business.creatorId = (await this.userService.findOneByExternalId(bubbleBusiness.creator_user))?.id;  //pull creator user id from postgres
                business.views = bubbleBusiness.views_number;
                business.facebook_link = bubbleBusiness.linkfb_text;
                business.instagram_link = bubbleBusiness.linkinsta_text;
                business.description = bubbleBusiness.description_text;
                business.logo_url = bubbleBusiness.logo_image;
                business.email = bubbleBusiness.businessemail_text;
                business.owner_user_id = (await this.userService.findOneByExternalId(bubbleBusiness.claimedowner_user))?.id;
                console.log('Syncing business:', business.name, business.creatorId);
                let savedbusiness = await this.businessService.createBusiness(business.creatorId || '', business);

                if (bubbleBusiness.businesscategories_x_list_option_business_category && bubbleBusiness.businesscategories_x_list_option_business_category.length > 0) {
                    const linkedEntries = bubbleBusiness.businesscategories_x_list_option_business_category.map((categoryOption: string) => {
                        let matchedType = businessTypes.data.find(bt => bt.name.includes(categoryOption));

                        this.linkedrepo.create({
                            business_id: savedbusiness.id,
                            business_type_id: matchedType?.id,
                            active: true,
                            created_by: business.creatorId,
                            modified_by: business.creatorId,
                        })
                    });
                    await this.linkedrepo.save(linkedEntries);
                }
            }

            return response.data; // Bubble returns { "response": { "results": [...] } } or { "response": [...] }
        } catch (error) {
            console.error('❌ Error fetching from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble data', HttpStatus.BAD_REQUEST);
        }
    }

    async syncUsers() {

        try {
            let cursor = 0;
            let remaining = 1;
            while (remaining >= 1) {
                console.log(`Fetching users with cursor: ${cursor} - ${remaining} remaining`);
                const response = await axios.get<any>(`${this.userApiUrl}?cursor=${cursor}&limit=100`, {
                    headers: {
                        Authorization: `Bearer ${this.apiToken}`,
                    },
                });

                if (cursor === 0) {
                    cursor = 100;
                }
                else {
                    cursor = cursor + 100;
                }

                remaining = response.data.response.remaining;
                const data = response.data as any;
                const bublleUsers: any[] = data?.response?.results ?? data?.response ?? [];
                for (const bubbleUser of bublleUsers) {
                    try {
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

        }
        catch (error) {
            console.error('❌ Error fetching users from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble user data', HttpStatus.BAD_REQUEST);
        }
    }
    fuzzyMatch(categoryOption: string, typeName: string): boolean {
        const normalize = (str: string) =>
            str
                .toLowerCase()
                .replace(/s\b/g, "") // remove plural s at end (hotels → hotel)
                .trim();

        const split = (str: string) =>
            str
                .toLowerCase()
                .split(/[/,|-]/)
                .map(x => normalize(x))
                .filter(Boolean);

        const optTokens = split(categoryOption);
        const typeTokens = split(typeName);

        return optTokens.some(opt =>
            typeTokens.some(t =>
                t.includes(opt) || opt.includes(t)
            )
        );
    }
    async syncAF() {
        console.log(`Syncing AF`);
        const response = await axios.get<any>(`${this.accessiblefeatureApiUrl}?cursor=0&limit=100`, {
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
            },
        });
        const data = response.data as any;
        let bubblefeatures: any[] = data?.response?.results ?? data?.response ?? [];
       // bubblefeatures = bubblefeatures.filter(bf => bf.title_text == "Accessible Bus");
        let featureTypes = await this.accessibleFeatureTypeRepo.find();
        let businessTypes = await this.businessTypeService.listPaginated(1, 1000);

        for (const bubbleFeature of bubblefeatures) {

            try {
                console.log(`${bubbleFeature.title_text}`);

                let userId = (await this.userService.findOneByExternalId(bubbleFeature.creator_user))?.id || '';
                const afDto = new AccessibleFeatureDto();
                afDto.external_id = bubbleFeature._id;
                afDto.title = bubbleFeature.title_text;
                bubbleFeature.category_list_option_business_category?.map((categoryOption: string) => {
                    console.log(`bt => ${categoryOption}`);

                    //let matchedType = businessTypes.data.find(ft => ft.name.toLowerCase().includes(categoryOption.toLowerCase()));
                    let matchedType = businessTypes.data.find(ft =>
                        this.fuzzyMatch(categoryOption, ft.name)
                    );
                    if (matchedType) {
                        afDto.business_type = afDto.business_type || [];
                        afDto.business_type.push(matchedType.id);
                    }
                    else {
                        console.log(`bt no match => ${categoryOption}, in DB ${businessTypes.data.join(',')}`);

                    }
                });
                featureTypes.forEach(ft => {
                    console.log(`ft => ${ft.name}`);
                    if( this.fuzzyMatch(bubbleFeature.type_option_feature_category, ft.name)){
                   // if (bubbleFeature.type_option_feature_category.toLowerCase().includes(ft.name.toLowerCase())) {
                        afDto.accessible_feature_types = afDto.accessible_feature_types || [];
                        afDto.accessible_feature_types.push(ft.id);
                    }
                    else {
                        console.log(`ft no match => in DB  ${ft.name}, ${bubbleFeature.type_option_feature_category}`);

                    }
                });
                await this.accessibleFeatureTypeService.createAccessibleFeature(userId, afDto);
            }
            catch (error) {

                console.error('❌ Error syncing AF from Bubble:', bubbleFeature.title_text, (error as any).response?.data || error);
            }
        }

    }
}
