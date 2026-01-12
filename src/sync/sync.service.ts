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
import { BusinessType } from 'src/entity/business-type.entity';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { BusinessVirtualTour } from 'src/entity/business_virtual_tours.entity';
import { ListingsVerified } from 'src/entity/listings-verified.entity';
import { Claims } from 'src/entity/claims.entity';
@Injectable()
export class SyncService {
    constructor(private readonly businessService: BusinessService,
        private readonly userService: UsersService,
        private readonly businessTypeService: BusinessTypeService,
        private readonly accessibleFeatureTypeService: AccessibleFeatureService,
        @InjectRepository(BusinessLinkedType)
        private readonly linkedrepo: Repository<BusinessLinkedType>,
        @InjectRepository(AccessibleFeatureType)
        private accessibleFeatureTypeRepo: Repository<AccessibleFeatureType>,
        @InjectRepository(BusinessAccessibleFeature)
        private readonly businessAccessibilityRepo: Repository<BusinessAccessibleFeature>,
        @InjectRepository(BusinessVirtualTour)
        private readonly virtualRepo: Repository<BusinessVirtualTour>,
        @InjectRepository(ListingsVerified)
        private readonly listingsVerifiedRepo: Repository<ListingsVerified>,
        @InjectRepository(Claims)
        private readonly claimsRepo: Repository<Claims>
    ) { }
    private readonly businessApiUrl = 'https://ablevu.com/api/1.1/obj/business';
    private readonly userApiUrl = 'https://ablevu.com/api/1.1/obj/user';
    private readonly accessiblefeatureApiUrl = 'https://ablevu.com/api/1.1/obj/accessiblefeature';
    private readonly businessAccessiblefeatureApiUrl = 'https://ablevu.com/api/1.1/obj/BusinessAccessibilityFeature';
    private readonly businessVirtualTourApiUrl = 'https://ablevu.com/api/1.1/obj/BusinessVirtualTour';
    private readonly apiToken = '431b5448a8357d0cd7a9f6bf570650e3';

    async SyncBusinesses() {
        let response = [];
        try {
            const businessTypes = await this.businessTypeService.listPaginated(1, 1000);
            console.log(businessTypes);

            let cursor = 0;
            let remaining = 1;
            while (remaining >= 1) {
                console.log(`Fetching users with cursor: ${cursor} - ${remaining} remaining`);
                const response = await axios.get<any>(`${this.businessApiUrl}?cursor=${cursor}&limit=100`, {
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
                console.log(response.data);


                // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
                const data = response.data as any;
                const businesses: any[] = data?.response?.results ?? data?.response ?? [];

                for (const bubbleBusiness of businesses) {
                    let existingBusiness = await this.businessService.findByExternalId(bubbleBusiness._id);                    
                    const business = new CreateBusinessDto();
                    business.external_id = bubbleBusiness._id;
                    business.name = bubbleBusiness.businessname_text;
                    business.description = bubbleBusiness.description_text || bubbleBusiness.businessname_text;
                    business.website = bubbleBusiness.businesswebsite_text;
                    business.city = bubbleBusiness.city_text || bubbleBusiness.state_text || 'Unknown City';
                    business.state = bubbleBusiness.state_text || 'Unknown State';
                    business.zipcode = bubbleBusiness.zip_text || 'xxxx';
                    business.address = bubbleBusiness.address_geographic_address?.address || `${bubbleBusiness.city_text}, ${bubbleBusiness.state_text} ${bubbleBusiness.zip_text}, ${bubbleBusiness.country_text}` || 'Unknown Address';
                    business.phone_number = bubbleBusiness.phonenumber_text;
                    business.latitude = bubbleBusiness.address_geographic_address?.lat;
                    business.longitude = bubbleBusiness.address_geographic_address?.lng;
                    business.logo_url = bubbleBusiness.logo_image;
                    business.status = bubbleBusiness.businessstatus__option_business_status_nature;
                    business.business_status = bubbleBusiness.businessstatus__option_business_status_nature;
                    business.creatorId = (await this.userService.findOneByExternalId(bubbleBusiness.creator_user))?.id;
                    business.views = bubbleBusiness.views_number;
                    business.facebook_link = bubbleBusiness.linkfb_text;
                    business.instagram_link = bubbleBusiness.linkinsta_text;
                    business.email = bubbleBusiness.businessemail_text;
                    business.owner_user_id = (await this.userService.findOneByExternalId(bubbleBusiness.claimedowner_user))?.id;
                    business.country = bubbleBusiness.country_text || 'USA';
                    console.log('Syncing business:', business.name, business.creatorId);
                    const categories = bubbleBusiness.businesscategories_x_list_option_business_category;

                    if (Array.isArray(categories) && categories.length > 0) {
                        const linkedEntries = categories
                            .map((categoryOption: string) => {
                                const matchedType = businessTypes.data.find((bt: any) =>
                                    this.fuzzyMatch(categoryOption, bt.name),
                                );

                                if (!matchedType) {
                                    // Optional: log missing mapping
                                    console.warn(`No business_type match for categoryOption "${categoryOption}"`);
                                    return null // Return null if no match found
                                }

                                return matchedType
                            })
                            .filter((x) => x !== null);
                        if (linkedEntries.length > 0) {
                            business.business_type = linkedEntries.map((bt: BusinessType) => bt.id);
                        }
                        else {
                            console.warn(`No valid business_type mappings found for business "${business.name}"`);
                            const id = businessTypes.data.find((bt: any) => this.fuzzyMatch('other', bt.name))?.id;
                            business.business_type = [id || businessTypes.data[0].id]; // Assign a default type if none matched
                        }
                    }
                    else {
                        console.warn(`No valid  mappings found for business "${business.name}"`);
                        const id = businessTypes.data.find((bt: any) => this.fuzzyMatch('other', bt.name))?.id;
                        business.business_type = [id || businessTypes.data[0].id]; // Assign a default type if none matched
                    }

                    // Check if business exists through external_id - CREATE or UPDATE
                if (existingBusiness) {
                    console.log(`Business with external_id ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} already exists. Updating...`);
                    await this.businessService.updateBusinessByExternalId(bubbleBusiness._id, business);
                    console.log(`✅ Updated business: ${business.name} (external_id: ${bubbleBusiness._id})`);
                } else {
                    console.log('Creating new business:', business.name, business.creatorId);
                    await this.businessService.createBusiness(business.creatorId || '', business);
                    console.log(`✅ Created business: ${business.name} (external_id: ${bubbleBusiness._id})`);
                }

                }


            }
        } catch (error) {
            console.error('❌ Error fetching from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble data', HttpStatus.BAD_REQUEST);
        }
        return response;
    }

    async SyncBusinessesAF() {
        let response = [];
        try {
            const accessiblityfeatures = await this.accessibleFeatureTypeService.getPaginatedList(1, 1000);
            console.log(JSON.stringify(accessiblityfeatures.items));

            let cursor = 0;
            let remaining = 1;
            while (remaining >= 1) {
                console.log(`Fetching users with cursor: ${cursor} - ${remaining} remaining`);
                const response = await axios.get<any>(`${this.businessAccessiblefeatureApiUrl}?cursor=${cursor}&limit=100`, {
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
                console.log(response.data);


                // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
                const data = response.data as any;
                const businesses: any[] = data?.response?.results ?? data?.response ?? [];

                for (const bubbleBusiness of businesses) {
                    let existingBusiness = await this.businessService.findByExternalId(bubbleBusiness.businesslinked1_custom_business);
                    if (!existingBusiness) {
                        console.log(`Business with external_id ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} already exists. Skipping.`);
                        continue; // Skip to the next business
                    }
                    console.log(`Start Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text}`);

                    const baf = bubbleBusiness.featureslist_list_custom_accessiblefeature;
                    console.log(`af found = ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${baf}`);

                    let userId = (await this.userService.findOneByExternalId(bubbleBusiness.creator_user))?.id
                    if (Array.isArray(baf) && baf.length > 0) {
                        for (const afExternalId of baf) {
                            const afType = accessiblityfeatures.items.find(af => af.external_id == afExternalId);
                            console.log(`Adding AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${JSON.stringify(afType)} ${afExternalId}`);

                            console.log(`Adding AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${afType?.title}`);
                            if (afType == null) {
                                console.log(`Skipping AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${afExternalId} as not found`);
                                continue;
                            }
                            let linkedFeature = this.businessAccessibilityRepo.create({
                                business_id: existingBusiness.id,
                                accessible_feature_id: afType?.id,
                                active: true,
                                created_by: userId,
                                modified_by: userId,
                            });
                            await this.businessAccessibilityRepo.save(linkedFeature);
                        }

                    }
                }


            }
        } catch (error) {
            console.error('❌ Error fetching from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble data', HttpStatus.BAD_REQUEST);
        }
        return response;
    }
    async SyncVirtualTour() {
        let response = [];
        try {


            let cursor = 0;
            let remaining = 1;
            while (remaining >= 1) {
                console.log(`Fetching users with cursor: ${cursor} - ${remaining} remaining`);
                const response = await axios.get<any>(`${this.businessVirtualTourApiUrl}?cursor=${cursor}&limit=100`, {
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
                console.log(response.data);


                // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
                const data = response.data as any;
                const businesses: any[] = data?.response?.results ?? data?.response ?? [];

                for (const bubbleBusiness of businesses) {
                    let existingBusiness = await this.businessService.findByExternalId(bubbleBusiness.businesslinked_custom_business);
                    if (!existingBusiness) {
                        console.log(`Business with external_id ${bubbleBusiness.businesslinked_custom_business}, ${bubbleBusiness.businesslinked_custom_business} already exists. Skipping.`);
                        continue; // Skip to the next business
                    }
                    console.log(`Start Syncing ${existingBusiness.name}, ${bubbleBusiness.title_text}`);



                    let userId = (await this.userService.findOneByExternalId(bubbleBusiness.creator_user))?.id
                    const tour = this.virtualRepo.create({
                        name: bubbleBusiness.title_text,
                        display_order: 0,
                        link_url: bubbleBusiness.tourlink_text,
                        active: true,
                        created_by: existingBusiness?.creator?.id,
                        modified_by: userId,
                        business: existingBusiness,
                    });

                    await this.virtualRepo.save(tour);
                }


            }
        } catch (error) {
            console.error('❌ Error fetching from Bubble:', (error as any).response?.data || error);
            throw new HttpException('Failed to fetch Bubble data', HttpStatus.BAD_REQUEST);
        }
        return response;
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

    async SyncAIChatbotDb() {
            const accessiblityfeatures = await this.accessibleFeatureTypeService.getPaginatedList(1, 1000);

        const businesses = await this.businessService.listPaginated(1, 1000);
        for (const business of businesses.data) {
            if(business.business_status?.toLowerCase() == 'Approved'.toLocaleLowerCase()
            || business.business_status?.toLowerCase() == 'Claimed'.toLocaleLowerCase( ) ){
           
            console.log(`Business: ${business.name}`);
            const virtualToursObj = await this.virtualRepo.findOne({
                where: {
                    business: { id: business.id },
                },
            });
            console.log(` Virtual Tours: ${virtualToursObj ? virtualToursObj.name : 'None'}`);

            let listingsVerifiedObj = new ListingsVerified();
            listingsVerifiedObj.business_id = business.id;
            listingsVerifiedObj.address = business.address;
            listingsVerifiedObj.city = business.city;
            listingsVerifiedObj.city_state = business.state;
            listingsVerifiedObj.name = business.name;
            listingsVerifiedObj.listing_id = business.external_id;;
            listingsVerifiedObj.last_verified = business.modified_at;
            listingsVerifiedObj.created_at = business.created_at;
            listingsVerifiedObj.updated_at = business.modified_at;
            listingsVerifiedObj.virtual_tour_url = virtualToursObj?.link_url;
            listingsVerifiedObj.profile_url = `https://ablevu.com/business-profile/${business.external_id}`;
            listingsVerifiedObj.suggest_edit_url = `https://ablevu.com/business-profile/${business.external_id}`;


             const af = await this.businessAccessibilityRepo.find({
                where: {
                    business_id: business.id}});
            const featureTitles = af
            .map(baf => accessiblityfeatures.items.find(af => af.id === baf.accessible_feature_id))
            .filter(ft => ft)                // remove nulls
            .map(ft => ft?.title);            // extract titles

            const afString = featureTitles.join(', ');   

            listingsVerifiedObj.features = afString;
            await this.listingsVerifiedRepo.create(listingsVerifiedObj);
            await this.listingsVerifiedRepo.save(listingsVerifiedObj);

            let claim = new Claims();
            claim.business_id = business.id;
            claim.listing_id = business.external_id || '';
            claim.status = business.business_status;
            claim.listing_name = business.name;
            claim.owner_name = business.owner?.first_name + ' ' + business.owner?.last_name;
            claim.owner_email = business.owner?.email || '';
            claim.phone = business.phone_number || '';
            claim.source = 'AI Chatbot DB Sync';
            claim.requested_on = business.created_at;
            claim.created_at = business.created_at;
            claim.updated_at = business.modified_at;
            await this.claimsRepo.create(claim);
            await this.claimsRepo.save(claim);

    
            }
            else{
                console.log(`Skipping Business: ${business.name} with status ${business.business_status}`);
            }
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
                    if (this.fuzzyMatch(bubbleFeature.type_option_feature_category, ft.name)) {
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
