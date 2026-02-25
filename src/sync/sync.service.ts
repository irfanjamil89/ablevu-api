import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// Install with:
// npm install axios
// npm install --save-dev @types/axios
import axios from 'axios';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'crypto';
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
import { CreateAccessibleCityDto } from 'src/accessible city/create-accessible-city.dto';
import { AccessibleCityService } from 'src/accessible city/accessible-city.service';
import { BusinessMedia } from 'src/entity/business_media.entity';
import { BusinessQuestions } from 'src/entity/business-questions.entity';
import { AdditionalResource } from 'src/entity/additional_resource.entity';
import { BusinessAudioTour } from 'src/entity/business_audio_tour.entity';
import { BusinessCustomSectionsMedia } from 'src/entity/business-custom-sections-media.entity';
import { BusinessCustomSections } from 'src/entity/business_custom_sections.entity';
import { BusinessImages } from 'src/entity/business_images.entity';
import { Partner } from 'src/entity/partner.entity';
import { BusinessPartners } from 'src/entity/business_partners.entity';
import { BusinessRecomendations } from 'src/entity/business_recomendations.entity';
import { BusinessSchedule } from 'src/entity/business_schedule.entity';
import { Feedback } from 'src/entity/feedback.entity';
import { FeedbackType } from 'src/entity/feedback-type.entity';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { ReviewType } from 'src/entity/review_type.entity';
import { Coupons } from 'src/entity/coupons.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { S3Service } from 'src/services/s3service';
import heicConvert from 'heic-convert';
import { Logger } from '@nestjs/common';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  constructor(
    private readonly businessService: BusinessService,
    private readonly userService: UsersService,
    private readonly businessTypeService: BusinessTypeService,
    private readonly accessibleFeatureTypeService: AccessibleFeatureService,
    private readonly accessibleCityService: AccessibleCityService,
    private readonly s3: S3Service,
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
    private readonly claimsRepo: Repository<Claims>,
    @InjectRepository(BusinessMedia)
    private readonly businessMediaRepo: Repository<BusinessMedia>,
    @InjectRepository(BusinessQuestions)
    private businessQuestionsRepo: Repository<BusinessQuestions>,
    @InjectRepository(AdditionalResource)
    private businessResourcesRepo: Repository<AdditionalResource>,
    @InjectRepository(BusinessAudioTour)
    private businessAudioTourRepo: Repository<BusinessAudioTour>,
    @InjectRepository(BusinessCustomSectionsMedia)
    private businessCustomSectionMediaRepo: Repository<BusinessCustomSectionsMedia>,
    @InjectRepository(BusinessCustomSections)
    private businessCustomSectionRepo: Repository<BusinessCustomSections>,
    @InjectRepository(BusinessImages)
    private businessImagesRepo: Repository<BusinessImages>,
    @InjectRepository(Partner)
    private partnerRepo: Repository<Partner>,
    @InjectRepository(BusinessPartners)
    private businessPartnersRepo: Repository<BusinessPartners>,
    @InjectRepository(BusinessRecomendations)
    private businessRecommendationsRepo: Repository<BusinessRecomendations>,
    @InjectRepository(BusinessSchedule)
    private businessScheduleRepo: Repository<BusinessSchedule>,
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
    @InjectRepository(FeedbackType)
    private feedbackTypeRepo: Repository<FeedbackType>,
    @InjectRepository(BusinessReviews)
    private businessReviewsRepo: Repository<BusinessReviews>,
    @InjectRepository(ReviewType)
    private reviewTypeRepo: Repository<ReviewType>,
    @InjectRepository(Coupons)
    private couponsRepo: Repository<Coupons>,
    @InjectRepository(Subscription)
    private subscriptionsRepo: Repository<Subscription>,
  ) {}
  private looksLikeS3(url: string) {
    const u = (url || '').toLowerCase();
    return (
      u.includes('amazonaws.com') ||
      u.includes('ablevu-storage') ||
      u.includes('s3.')
    );
  }

  /**
   * Bubble sometimes returns protocol-relative URLs like:
   *   //411bac....cdn.bubble.io/....
   * fetch() can't parse them, so we must normalize to https://
   */
  private normalizeUrl(url: string) {
    const u = (url || '').trim();

    if (!u) return u;

    // ✅ protocol-relative -> add https:
    if (u.startsWith('//')) return `https:${u}`;

    // ✅ already valid
    if (u.startsWith('http://') || u.startsWith('https://')) return u;

    // ✅ if looks like bubble domain but missing scheme
    if (u.includes('.bubble.io/')) return `https://${u}`;

    return u;
  }

  private async downloadToBuffer(url: string): Promise<Buffer> {
  const finalUrl = this.normalizeUrl(url);

  const res = await fetch(finalUrl, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}) ${finalUrl}`);

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  if (!buf.length) throw new Error(`Empty download buffer ${finalUrl}`);

  return buf; // ✅ don't reject octet-stream
}


 

private async normalizeImage(buffer: Buffer, sourceUrl?: string) {
  const head = buffer.slice(0, 32).toString('utf8');

  let ft = await fileTypeFromBuffer(buffer);
  let mime = ft?.mime;
  let ext = ft?.ext;

  const urlLooksHeic = !!sourceUrl && /\.(heic|heif)$/i.test(sourceUrl.split('?')[0]);
  const bytesLookHeic = head.includes('ftypheic') || head.includes('ftypheif') || head.includes('heic');

  const isHeic = mime === 'image/heic' || mime === 'image/heif' || urlLooksHeic || bytesLookHeic;

  if (isHeic) {
    this.logger.log(`HEIC detected -> converting using heic-convert`);

    const out = await heicConvert({
      buffer,
      format: 'JPEG',
      quality: 0.9,
    });

    const jpgBuffer = Buffer.isBuffer(out) ? out : Buffer.from(out);

    // validate output (optional but helpful)
    const outType = await fileTypeFromBuffer(jpgBuffer);
    if (!outType || outType.mime !== 'image/jpeg') {
      throw new Error(`HEIC convert produced invalid output: ${outType?.mime || 'unknown'}`);
    }

    return { buffer: jpgBuffer, mime: 'image/jpeg', ext: 'jpg' };
  }

  // Non-HEIC: must be detectable
  if (!mime) throw new Error('Unable to detect image type');
  if (!ext) ext = 'jpg';

  return { buffer, mime, ext };
}



  /**
   * Bubble URL -> S3 URL
   * folder: business-images/<businessId>
   * fileName: <externalImageId> (stable)
   */
  private async uploadBusinessImageToS3(params: {
    businessId: string;
    externalImageId: string;
    bubbleUrl: string;
  }) {
    const { businessId, externalImageId } = params;

    const bubbleUrl = this.normalizeUrl(params.bubbleUrl);

    if (!bubbleUrl?.trim()) return null;

    // if already S3 -> keep
    if (this.looksLikeS3(bubbleUrl)) return bubbleUrl;

    const raw = await this.downloadToBuffer(bubbleUrl);
const normalized = await this.normalizeImage(raw, bubbleUrl);

const res = await this.s3.uploadRawBuffer({
  buffer: normalized.buffer,
  contentType: normalized.mime,
  folder: `business-images/${businessId}`,
  extension: normalized.ext,
  fileName: externalImageId || randomUUID(),
});

    if (!res?.url) throw new Error(`S3 returned empty url (key=${res?.key})`);

    return res.url.replace(/\/{2,}/g, '/').replace('https:/', 'https://');
  }

  /**
   * Concurrency runner: processes items in batches
   */
  private async runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<void>,
  ) {
    let idx = 0;
    const runners = Array.from({ length: Math.max(1, concurrency) }).map(
      async () => {
        while (idx < items.length) {
          const current = items[idx++];
          await worker(current);
        }
      },
    );
    await Promise.all(runners);
  }

  private readonly businessApiUrl =
    'https://ablevu-54161.bubbleapps.io/api/1.1/obj/business';
  private readonly userApiUrl =
    'https://ablevu-54161.bubbleapps.io/api/1.1/obj/user';
  private readonly accessiblefeatureApiUrl =
    'https://ablevu-54161.bubbleapps.io/api/1.1/obj/accessiblefeature';
  private readonly businessAccessiblefeatureApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessAccessibilityFeature';
  private readonly businessVirtualTourApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessVirtualTour';
  private readonly accessiblecityApiUrl =
    'https://ablevu.com/api/1.1/obj/accessiblecity';
  private readonly businessAccessibilityMediaApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessAccessibilityMedia';
  private readonly businessAccessibilityQuestionsApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessAccessibilityQuestion';
  private readonly businessAdditionalResourcesApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessAdditionalResources';
  private readonly businessAudioToursApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessAudioTour';
  private readonly businessCustomMediaApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessCustomMedia';
  private readonly businessCustomSectionApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessCustomSection';
  private readonly businessImagesApiUrl =
    'https://ablevu-54161.bubbleapps.io/api/1.1/obj/BusinessImage';
  private readonly partnerApiUrl = 'https://ablevu.com/api/1.1/obj/Partner';
  private readonly businessPartnersApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessPartners';
  private readonly businessRecommendationsApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessRecommendations';
  private readonly businessScheduleApiUrl =
    'https://ablevu.com/api/1.1/obj/BusinessSchedule';
  private readonly feedbackApiUrl = 'https://ablevu.com/api/1.1/obj/Feedback';
  private readonly businessReviewsApiUrl =
    'https://ablevu.com/api/1.1/obj/businessReview';
  private readonly couponsApiUrl = 'https://ablevu.com/api/1.1/obj/CouponCode';
  private readonly subscriptionsApiUrl =
    'https://ablevu.com/api/1.1/obj/Subscription';
  private readonly apiToken = '431b5448a8357d0cd7a9f6bf570650e3';

  async SyncBusinesses() {
    let response = [];
    try {
      const businessTypes = await this.businessTypeService.listPaginated(
        1,
        1000,
      );
      console.log(businessTypes);

      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching users with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businesses: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleBusiness of businesses) {
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleBusiness._id,
          );
          const business = new CreateBusinessDto();
          business.external_id = bubbleBusiness._id;
          business.name = bubbleBusiness.businessname_text;
          business.description =
            bubbleBusiness.description_text || bubbleBusiness.businessname_text;
          business.website = bubbleBusiness.businesswebsite_text;
          business.city =
            bubbleBusiness.city_text ||
            bubbleBusiness.state_text ||
            'Unknown City';
          business.state = bubbleBusiness.state_text || 'Unknown State';
          business.zipcode = bubbleBusiness.zip_text || 'xxxx';
          business.address =
            bubbleBusiness.address_geographic_address?.address ||
            `${bubbleBusiness.city_text}, ${bubbleBusiness.state_text} ${bubbleBusiness.zip_text}, ${bubbleBusiness.country_text}` ||
            'Unknown Address';
          business.phone_number = bubbleBusiness.phonenumber_text;
          business.latitude = bubbleBusiness.address_geographic_address?.lat;
          business.longitude = bubbleBusiness.address_geographic_address?.lng;
          business.logo_url = bubbleBusiness.logo_image;
          business.status =
            bubbleBusiness.businessstatus__option_business_status_nature;
          business.business_status =
            bubbleBusiness.businessstatus__option_business_status_nature;
          business.creatorId = (
            await this.userService.findOneByExternalId(
              bubbleBusiness.creator_user,
            )
          )?.id;
          business.views = bubbleBusiness.views_number;
          business.facebook_link = bubbleBusiness.linkfb_text;
          business.instagram_link = bubbleBusiness.linkinsta_text;
          business.email = bubbleBusiness.businessemail_text;
          business.owner_user_id = (
            await this.userService.findOneByExternalId(
              bubbleBusiness.claimedowner_user,
            )
          )?.id;
          business.country = bubbleBusiness.country_text || 'USA';
          console.log('Syncing business:', business.name, business.creatorId);
          const categories =
            bubbleBusiness.businesscategories_x_list_option_business_category;

          if (Array.isArray(categories) && categories.length > 0) {
            const linkedEntries = categories
              .map((categoryOption: string) => {
                const matchedType = businessTypes.data.find((bt: any) =>
                  this.fuzzyMatch(categoryOption, bt.name),
                );

                if (!matchedType) {
                  // Optional: log missing mapping
                  console.warn(
                    `No business_type match for categoryOption "${categoryOption}"`,
                  );
                  return null; // Return null if no match found
                }

                return matchedType;
              })
              .filter((x) => x !== null);
            if (linkedEntries.length > 0) {
              business.business_type = linkedEntries.map(
                (bt: BusinessType) => bt.id,
              );
            } else {
              console.warn(
                `No valid business_type mappings found for business "${business.name}"`,
              );
              const id = businessTypes.data.find((bt: any) =>
                this.fuzzyMatch('other', bt.name),
              )?.id;
              business.business_type = [id || businessTypes.data[0].id]; // Assign a default type if none matched
            }
          } else {
            console.warn(
              `No valid  mappings found for business "${business.name}"`,
            );
            const id = businessTypes.data.find((bt: any) =>
              this.fuzzyMatch('other', bt.name),
            )?.id;
            business.business_type = [id || businessTypes.data[0].id]; // Assign a default type if none matched
          }

          // Check if business exists through external_id - CREATE or UPDATE
          if (existingBusiness) {
            console.log(
              `Business with external_id ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} already exists. Updating...`,
            );
            await this.businessService.updateBusinessByExternalId(
              bubbleBusiness._id,
              business,
            );
            console.log(
              `✅ Updated business: ${business.name} (external_id: ${bubbleBusiness._id})`,
            );
          } else {
            console.log(
              'Creating new business:',
              business.name,
              business.creatorId,
            );
            await this.businessService.createBusiness(
              business.creatorId || '',
              business,
            );
            console.log(
              `✅ Created business: ${business.name} (external_id: ${bubbleBusiness._id})`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessesAF() {
    let response = [];
    try {
      const accessiblityfeatures =
        await this.accessibleFeatureTypeService.getPaginatedList(1, 1000);
      console.log(JSON.stringify(accessiblityfeatures.items));

      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching users with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessAccessiblefeatureApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businesses: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleBusiness of businesses) {
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleBusiness.businesslinked1_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} already exists. Skipping.`,
            );
            continue; // Skip to the next business
          }
          console.log(
            `Start Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text}`,
          );

          const baf = bubbleBusiness.featureslist_list_custom_accessiblefeature;
          console.log(
            `af found = ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${baf}`,
          );

          let userId = (
            await this.userService.findOneByExternalId(
              bubbleBusiness.creator_user,
            )
          )?.id;
          if (Array.isArray(baf) && baf.length > 0) {
            for (const afExternalId of baf) {
              const afType = accessiblityfeatures.items.find(
                (af) => af.external_id == afExternalId,
              );
              console.log(
                `Adding AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${JSON.stringify(afType)} ${afExternalId}`,
              );

              console.log(
                `Adding AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${afType?.title}`,
              );
              if (afType == null) {
                console.log(
                  `Skipping AF to business Syncing ${bubbleBusiness._id}, ${bubbleBusiness.businessname_text} ${afExternalId} as not found`,
                );
                continue;
              }

              // Check if this accessibility feature is already linked to the business
              const existingLink = await this.businessAccessibilityRepo.findOne(
                {
                  where: {
                    business_id: existingBusiness.id,
                    accessible_feature_id: afType.id,
                  },
                },
              );

              if (existingLink) {
                // Update existing link
                console.log(
                  `✅ AF already exists - Updating: ${afType.title} for business ${existingBusiness.name}`,
                );
                existingLink.active = true;
                if (userId) {
                  existingLink.modified_by = userId;
                }
                existingLink.modified_at = new Date();
                await this.businessAccessibilityRepo.save(existingLink);
                console.log(`✅ Updated AF link: ${afType.title}`);
              } else {
                // Create new link
                console.log(
                  `Creating new AF link: ${afType.title} for business ${existingBusiness.name}`,
                );
                let linkedFeature = this.businessAccessibilityRepo.create({
                  business_id: existingBusiness.id,
                  accessible_feature_id: afType.id,
                  active: true,
                  created_by: userId,
                  modified_by: userId,
                });
                await this.businessAccessibilityRepo.save(linkedFeature);
                console.log(`✅ Created AF link: ${afType.title}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncVirtualTour() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching users with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessVirtualTourApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businesses: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleBusiness of businesses) {
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleBusiness.businesslinked_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleBusiness.businesslinked_custom_business}, ${bubbleBusiness.businesslinked_custom_business} already exists. Skipping.`,
            );
            continue; // Skip to the next business
          }
          console.log(
            `Start Syncing ${existingBusiness.name}, ${bubbleBusiness.title_text}`,
          );

          let userId = (
            await this.userService.findOneByExternalId(
              bubbleBusiness.creator_user,
            )
          )?.id;
          // Check if virtual tour already exists for this business with same link
          const existingTour = await this.virtualRepo.findOne({
            where: {
              business: { id: existingBusiness.id },
              link_url: bubbleBusiness.tourlink_text,
            },
          });

          if (existingTour) {
            // Update existing virtual tour
            console.log(
              `Virtual Tour already exists - Updating: ${bubbleBusiness.title_text}`,
            );
            existingTour.name = bubbleBusiness.title_text;
            existingTour.link_url = bubbleBusiness.tourlink_text;
            existingTour.active = true;
            if (userId) {
              existingTour.modified_by = userId;
            }
            existingTour.modified_at = new Date();
            await this.virtualRepo.save(existingTour);
            console.log(`Updated Virtual Tour: ${bubbleBusiness.title_text}`);
          } else {
            // Create new virtual tour
            console.log(
              `Creating new Virtual Tour: ${bubbleBusiness.title_text}`,
            );
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
            console.log(`Created Virtual Tour: ${bubbleBusiness.title_text}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async syncUsers() {
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching users with cursor: ${cursor} - ${remaining} remaining`,
        );

        const response = await axios.get<any>(
          `${this.userApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );

        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        const data = response.data as any;
        const bublleUsers: any[] =
          data?.response?.results ?? data?.response ?? [];
        for (const bubbleUser of bublleUsers) {
          try {
            // Check if user already exists by external_id
            let existingUser = await this.userService.findOneByExternalId(
              bubbleUser._id,
            );

            if (existingUser) {
              // // Update existing user
              console.log(
                `User already exists - Updating: ${bubbleUser.authentication.email.email}`,
              );
              // existingUser.email = bubbleUser.authentication.email.email;
              // existingUser.first_name = bubbleUser.firstname_text;
              // existingUser.last_name = bubbleUser.lastname_text;
              // existingUser.archived = !bubbleUser.useractive_boolean;
              // existingUser.user_role = bubbleUser.userrole1_option_user_role0;
              // existingUser.modified_at = new Date(bubbleUser['Modified Date']);
              // existingUser.consent = bubbleUser.user_signed_up || false;
              // existingUser.phone_number = bubbleUser.phone_number_text;
              // existingUser.paid_contributor = bubbleUser.paidcontributor_boolean || false;
              // existingUser.customer_id = bubbleUser.StripeCustomerID || null;
              // existingUser.profile_picture_url = bubbleUser.profilepicture_image || null;
              // existingUser.source = 'bubble';

              // console.log('Updating user:', existingUser.email);
              // await this.userService.save(existingUser);
              // console.log(`Updated user: ${existingUser.email}`);
            } else {
              // Create new user
              console.log(
                `Creating new user: ${bubbleUser.authentication.email.email}`,
              );
              const passwordHash = await bcrypt.hash('StrongP@ssw0rd!', 12);
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
              user.paid_contributor =
                bubbleUser.paidcontributor_boolean || false;
              user.customer_id = bubbleUser.StripeCustomerID || null;
              user.profile_picture_url =
                bubbleUser.profilepicture_image || null;
              user.password = passwordHash;
              user.source = 'bubble';

              console.log('Syncing user:', user.email);
              console.log('Syncing user:', user.first_name);
              await this.userService.save(user);
              console.log(`Created user: ${user.email}`);
            }
          } catch (error) {
            console.error(
              '❌ Error syncing user from Bubble:',
              bubbleUser.authentication.email.email,
              (error as any).response?.data || error,
            );
          }
        }
        console.log(response.data);
      }
    } catch (error) {
      console.error(
        '❌ Error fetching users from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble user data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async SyncAIChatbotDb() {
    const accessiblityfeatures =
      await this.accessibleFeatureTypeService.getPaginatedList(1, 1000);

    const businesses = await this.businessService.listPaginated(1, 1000);
    for (const business of businesses.data) {
      if (
        business.business_status?.toLowerCase() ==
          'Approved'.toLocaleLowerCase() ||
        business.business_status?.toLowerCase() == 'Claimed'.toLocaleLowerCase()
      ) {
        console.log(`Business: ${business.name}`);
        const virtualToursObj = await this.virtualRepo.findOne({
          where: {
            business: { id: business.id },
          },
        });
        console.log(
          ` Virtual Tours: ${virtualToursObj ? virtualToursObj.name : 'None'}`,
        );

        // Check if ListingsVerified already exists for this business
        let listingsVerifiedObj = await this.listingsVerifiedRepo.findOne({
          where: {
            business_id: business.id,
          },
        });

        // If not exists, create new instance
        if (!listingsVerifiedObj) {
          console.log(`Creating new ListingsVerified for business: ${business.name}`);
          listingsVerifiedObj = new ListingsVerified();
        } else {
          console.log(`Updating existing ListingsVerified for business: ${business.name}`);
        }

        // Set/Update all fields
        listingsVerifiedObj.business_id = business.id;
        listingsVerifiedObj.address = business.address;
        listingsVerifiedObj.city = business.city;
        listingsVerifiedObj.city_state = business.state;
        listingsVerifiedObj.name = business.name;
        listingsVerifiedObj.listing_id = business.external_id;
        listingsVerifiedObj.last_verified = business.modified_at;
        listingsVerifiedObj.created_at = business.created_at;
        listingsVerifiedObj.updated_at = business.modified_at;
        listingsVerifiedObj.virtual_tour_url = virtualToursObj?.link_url;
        listingsVerifiedObj.profile_url = `https://ablevu.com/business-profile/${business.external_id}`;
        listingsVerifiedObj.suggest_edit_url = `https://ablevu.com/business-profile/${business.external_id}`;

        const af = await this.businessAccessibilityRepo.find({
          where: {
            business_id: business.id,
          },
        });
        const featureTitles = af
          .map((baf) =>
            accessiblityfeatures.items.find(
              (af) => af.id === baf.accessible_feature_id,
            ),
          )
          .filter((ft) => ft) // remove nulls
          .map((ft) => ft?.title); // extract titles

        const afString = featureTitles.join(', ');

        listingsVerifiedObj.features = afString;
        await this.listingsVerifiedRepo.save(listingsVerifiedObj);

        // Check if Claims already exists for this business
        let claim = await this.claimsRepo.findOne({
          where: {
            business_id: business.id,
          },
        });

        // If not exists, create new instance
        if (!claim) {
          console.log(`Creating new Claim for business: ${business.name}`);
          claim = new Claims();
        } else {
          console.log(`Updating existing Claim for business: ${business.name}`);
        }

        // Set/Update all fields
        claim.business_id = business.id;
        claim.listing_id = business.external_id || '';
        claim.status = business.business_status;
        claim.listing_name = business.name;
        claim.owner_name =
          business.owner?.first_name + ' ' + business.owner?.last_name;
        claim.owner_email = business.owner?.email || '';
        claim.phone = business.phone_number || '';
        claim.source = 'AI Chatbot DB Sync';
        claim.requested_on = business.created_at;
        claim.created_at = business.created_at;
        claim.updated_at = business.modified_at;
        await this.claimsRepo.save(claim);
      } else {
        console.log(
          `Skipping Business: ${business.name} with status ${business.business_status}`,
        );
      }
    }
  }
  
  fuzzyMatch(categoryOption: string, typeName: string): boolean {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/s\b/g, '') // remove plural s at end (hotels → hotel)
        .trim();

    const split = (str: string) =>
      str
        .toLowerCase()
        .split(/[/,|-]/)
        .map((x) => normalize(x))
        .filter(Boolean);

    const optTokens = split(categoryOption);
    const typeTokens = split(typeName);

    return optTokens.some((opt) =>
      typeTokens.some((t) => t.includes(opt) || opt.includes(t)),
    );
  }

  async syncAF() {
    console.log(`Syncing AF`);
    const response = await axios.get<any>(
      `${this.accessiblefeatureApiUrl}?cursor=0&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );
    const data = response.data as any;
    let bubblefeatures: any[] = data?.response?.results ?? data?.response ?? [];
    // bubblefeatures = bubblefeatures.filter(bf => bf.title_text == "Accessible Bus");
    let featureTypes = await this.accessibleFeatureTypeRepo.find();
    let businessTypes = await this.businessTypeService.listPaginated(1, 1000);

    for (const bubbleFeature of bubblefeatures) {
      try {
        console.log(`${bubbleFeature.title_text}`);

        let userId =
          (
            await this.userService.findOneByExternalId(
              bubbleFeature.creator_user,
            )
          )?.id || '';

        // Check if accessible feature already exists by external_id
        let existingFeature =
          await this.accessibleFeatureTypeService.findByExternalId(
            bubbleFeature._id,
          );

        const afDto = new AccessibleFeatureDto();
        afDto.external_id = bubbleFeature._id;
        afDto.title = bubbleFeature.title_text;
        bubbleFeature.category_list_option_business_category?.map(
          (categoryOption: string) => {
            console.log(`bt => ${categoryOption}`);

            //let matchedType = businessTypes.data.find(ft => ft.name.toLowerCase().includes(categoryOption.toLowerCase()));
            let matchedType = businessTypes.data.find((ft) =>
              this.fuzzyMatch(categoryOption, ft.name),
            );
            if (matchedType) {
              afDto.business_type = afDto.business_type || [];
              afDto.business_type.push(matchedType.id);
            } else {
              console.log(
                `bt no match => ${categoryOption}, in DB ${businessTypes.data.join(',')}`,
              );
            }
          },
        );
        featureTypes.forEach((ft) => {
          console.log(`ft => ${ft.name}`);
          if (
            this.fuzzyMatch(bubbleFeature.type_option_feature_category, ft.name)
          ) {
            // if (bubbleFeature.type_option_feature_category.toLowerCase().includes(ft.name.toLowerCase())) {
            afDto.accessible_feature_types =
              afDto.accessible_feature_types || [];
            afDto.accessible_feature_types.push(ft.id);
          } else {
            console.log(
              `ft no match => in DB  ${ft.name}, ${bubbleFeature.type_option_feature_category}`,
            );
          }
        });
        if (existingFeature) {
          // Update existing accessible feature
          console.log(
            `Accessible Feature already exists - Updating: ${bubbleFeature.title_text}`,
          );
          await this.accessibleFeatureTypeService.updateAccessibleFeatureByExternalId(
            bubbleFeature._id,
            userId,
            afDto,
          );
          console.log(
            `Updated Accessible Feature: ${bubbleFeature.title_text}`,
          );
        } else {
          // Create new accessible feature
          console.log(
            `Creating new Accessible Feature: ${bubbleFeature.title_text}`,
          );
          await this.accessibleFeatureTypeService.createAccessibleFeature(
            userId,
            afDto,
          );
          console.log(
            `Created Accessible Feature: ${bubbleFeature.title_text}`,
          );
        }
      } catch (error) {
        console.error(
          '❌ Error syncing AF from Bubble:',
          bubbleFeature.title_text,
          (error as any).response?.data || error,
        );
      }
    }
  }

  async SyncAC() {
    console.log(`Syncing Accessible Cities`);
    const response = await axios.get<any>(
      `${this.accessiblecityApiUrl}?cursor=0&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );
    const data = response.data as any;
    let bubbleCities: any[] = data?.response?.results ?? data?.response ?? [];

    console.log(`Found ${bubbleCities.length} cities to sync`);

    for (const bubbleCity of bubbleCities) {
      try {
        if (!bubbleCity.city_text) {
          console.warn('Skipping city with no city_text field');
          continue;
        }

        console.log(`Processing city: ${bubbleCity.city_text}`);

        const user = await this.userService.findOneByExternalId(
          bubbleCity['Created By'],
        );

        if (!user || !user.id) {
          console.error(
            `User not found for external_id: ${bubbleCity['Created By']} - Skipping city: ${bubbleCity.city_text}`,
          );
          continue; // Skip this city if user doesn't exist
        }

        let userId = user.id;
        let existingCity = await this.accessibleCityService.findByExternalId(
          bubbleCity._id,
        );

        const cityDto = new CreateAccessibleCityDto();
        cityDto.cityName = bubbleCity.city_text;
        cityDto.featured = bubbleCity.featured_boolean || false;
        cityDto.displayOrder = bubbleCity.ordernumber_number || 0;
        cityDto.pictureUrl = bubbleCity.picture_image;

        if (bubbleCity.geolocation_geographic_address) {
          cityDto.latitude = bubbleCity.geolocation_geographic_address.lat;
          cityDto.longitude = bubbleCity.geolocation_geographic_address.lng;
        }

        cityDto.business_Ids = [];
        const businessList = bubbleCity.businesses_list_custom_business || [];

        if (Array.isArray(businessList) && businessList.length > 0) {
          for (const businessExternalId of businessList) {
            try {
              const business =
                await this.businessService.findByExternalId(businessExternalId);
              if (business) {
                cityDto.business_Ids.push(business.id);
              }
            } catch (error) {
              // Business doesn't exist yet
            }
          }
        }

        if (cityDto.business_Ids.length === 0) {
          console.log(
            `City ${bubbleCity.city_text} has no businesses yet - will be added later`,
          );
        }

        if (existingCity) {
          console.log(`Updating: ${bubbleCity.city_text}`);
          await this.accessibleCityService.updateAccessibleCityByExternalId(
            bubbleCity._id,
            userId,
            cityDto,
          );
          console.log(`Updated: ${bubbleCity.city_text}`);
        } else {
          console.log(`Creating: ${bubbleCity.city_text}`);
          await this.accessibleCityService.createAccessibleCity(
            userId,
            cityDto,
            bubbleCity._id,
          );
          console.log(`Created: ${bubbleCity.city_text}`);
        }
      } catch (error) {
        console.error(
          'Error syncing city:',
          bubbleCity?.city_text || 'Unknown',
          error,
        );
      }
    }

    console.log('Accessible Cities sync completed');
  }
  async SyncBusinessesAM() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business accessibility media with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessAccessibilityMediaApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessMediaItems: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleMedia of businessMediaItems) {
          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleMedia.businesslinked_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleMedia.businesslinked_custom_business} not found. Skipping media ${bubbleMedia._id}.`,
            );
            continue;
          }
          console.log(
            `Start Syncing Media ${bubbleMedia._id}, ${bubbleMedia.mediatitle_text} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleMedia['Created By'],
            )
          )?.id;

          // Check if this media already exists by external_id
          const existingMedia = await this.businessMediaRepo.findOne({
            where: {
              external_id: bubbleMedia._id,
            },
          });

          if (existingMedia) {
            // Update existing media
            console.log(
              `✅ Media already exists - Updating: ${bubbleMedia.mediatitle_text}`,
            );
            existingMedia.business_id = existingBusiness.id;
            existingMedia.label = bubbleMedia.mediatitle_text || null;
            existingMedia.link = bubbleMedia.medialink_text || null;
            existingMedia.description = bubbleMedia.mediadesc_text || null;
            existingMedia.active = bubbleMedia.approved__boolean ?? true;
            if (creatorUserId) {
              existingMedia.modified_by = creatorUserId;
            }
            existingMedia.modified_at = new Date();
            await this.businessMediaRepo.save(existingMedia);
            console.log(`✅ Updated media: ${bubbleMedia.mediatitle_text}`);
          } else {
            // Create new media
            console.log(
              `Creating new media: ${bubbleMedia.mediatitle_text} for business ${existingBusiness.name}`,
            );
            let newMedia = this.businessMediaRepo.create({
              external_id: bubbleMedia._id,
              business_id: existingBusiness.id,
              label: bubbleMedia.mediatitle_text || null,
              link: bubbleMedia.medialink_text || null,
              description: bubbleMedia.mediadesc_text || null,
              active: bubbleMedia.approved__boolean ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessMediaRepo.save(newMedia);
            console.log(`✅ Created media: ${bubbleMedia.mediatitle_text}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business media from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business media data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncBusinessesAQ() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business questions with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessAccessibilityQuestionsApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessQuestions: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleQuestion of businessQuestions) {
          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleQuestion.business_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleQuestion.business_custom_business} not found. Skipping question ${bubbleQuestion._id}.`,
            );
            continue;
          }
          console.log(
            `Start Syncing Question ${bubbleQuestion._id}, ${bubbleQuestion.question_text} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleQuestion['Created By'],
            )
          )?.id;

          // Check if this question already exists by external_id
          const existingQuestion = await this.businessQuestionsRepo.findOne({
            where: {
              external_id: bubbleQuestion._id,
            },
          });

          if (existingQuestion) {
            // Update existing question
            console.log(
              `✅ Question already exists - Updating: ${bubbleQuestion.question_text}`,
            );
            existingQuestion.business_id = existingBusiness.id;
            existingQuestion.question = bubbleQuestion.question_text || null;
            existingQuestion.answer = bubbleQuestion.answer_text || null;
            existingQuestion.active =
              bubbleQuestion['approved?_boolean'] ?? true;
            existingQuestion.show_name =
              bubbleQuestion['showName?_boolean'] ?? true;
            if (creatorUserId) {
              existingQuestion.modified_by = creatorUserId;
            }
            existingQuestion.modified_at = new Date();
            await this.businessQuestionsRepo.save(existingQuestion);
            console.log(`✅ Updated question: ${bubbleQuestion.question_text}`);
          } else {
            // Create new question
            console.log(
              `Creating new question: ${bubbleQuestion.question_text} for business ${existingBusiness.name}`,
            );
            let newQuestion = this.businessQuestionsRepo.create({
              external_id: bubbleQuestion._id,
              business_id: existingBusiness.id,
              question: bubbleQuestion.question_text || null,
              answer: bubbleQuestion.answer_text || null,
              active: bubbleQuestion['approved?_boolean'] ?? true,
              show_name: bubbleQuestion['showName?_boolean'] ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessQuestionsRepo.save(newQuestion);
            console.log(`✅ Created question: ${bubbleQuestion.question_text}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business questions from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business questions data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessesAR() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business resources with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessAdditionalResourcesApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessResources: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleResource of businessResources) {
          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleResource.busiensslinked_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleResource.busiensslinked_custom_business} not found. Skipping resource ${bubbleResource._id}.`,
            );
            continue;
          }
          console.log(
            `Start Syncing Resource ${bubbleResource._id}, ${bubbleResource.title_text} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleResource['Created By'],
            )
          )?.id;

          // Check if this resource already exists by external_id
          const existingResource = await this.businessResourcesRepo.findOne({
            where: {
              external_id: bubbleResource._id,
            },
          });

          if (existingResource) {
            // Update existing resource
            console.log(
              `✅ Resource already exists - Updating: ${bubbleResource.title_text}`,
            );
            existingResource.business_id = existingBusiness.id;
            existingResource.label = bubbleResource.title_text || null;
            existingResource.link = bubbleResource.link_text || null;
            existingResource.active =
              bubbleResource['approved?_boolean'] ?? true;
            if (creatorUserId) {
              existingResource.modified_by = creatorUserId;
            }
            existingResource.modified_at = new Date();
            await this.businessResourcesRepo.save(existingResource);
            console.log(`✅ Updated resource: ${bubbleResource.title_text}`);
          } else {
            // Create new resource
            console.log(
              `Creating new resource: ${bubbleResource.title_text} for business ${existingBusiness.name}`,
            );
            let newResource = this.businessResourcesRepo.create({
              external_id: bubbleResource._id,
              business_id: existingBusiness.id,
              label: bubbleResource.title_text || null,
              link: bubbleResource.link_text || null,
              active: bubbleResource['approved?_boolean'] ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessResourcesRepo.save(newResource);
            console.log(`✅ Created resource: ${bubbleResource.title_text}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business resources from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business resources data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessesAT() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business audio tours with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessAudioToursApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessAudioTours: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleAudioTour of businessAudioTours) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Audio Tour Fields:',
            JSON.stringify(bubbleAudioTour, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleAudioTour.businessid_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleAudioTour.businessid_custom_business} not found. Skipping audio tour ${bubbleAudioTour._id}.`,
            );
            continue;
          }

          // Use filename if available, otherwise create default name
          // FIXED: Ensure we always have a valid name (never null/undefined)
          const audioTourName =
            bubbleAudioTour.filename_text &&
            bubbleAudioTour.filename_text.trim() !== ''
              ? bubbleAudioTour.filename_text.trim()
              : `Audio Tour - ${bubbleAudioTour._id}`;

          console.log(
            `Start Syncing Audio Tour ${bubbleAudioTour._id}, ${audioTourName} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleAudioTour['Created By'],
            )
          )?.id;

          // Check if this audio tour already exists by external_id
          const existingAudioTour = await this.businessAudioTourRepo.findOne({
            where: {
              external_id: bubbleAudioTour._id,
            },
          });

          if (existingAudioTour) {
            // Update existing audio tour
            console.log(
              `✅ Audio Tour already exists - Updating: ${audioTourName}`,
            );
            existingAudioTour.business_id = existingBusiness.id;
            existingAudioTour.name = audioTourName; // FIXED: Use the computed name
            existingAudioTour.link_url = bubbleAudioTour.audiofile_file || null;
            existingAudioTour.active =
              bubbleAudioTour.approved__boolean ?? true;
            if (creatorUserId) {
              existingAudioTour.modified_by = creatorUserId;
            }
            existingAudioTour.modified_at = new Date();
            await this.businessAudioTourRepo.save(existingAudioTour);
            console.log(`✅ Updated audio tour: ${audioTourName}`);
          } else {
            // Create new audio tour
            console.log(
              `Creating new audio tour: ${audioTourName} for business ${existingBusiness.name}`,
            );
            let newAudioTour = this.businessAudioTourRepo.create({
              external_id: bubbleAudioTour._id,
              business_id: existingBusiness.id,
              name: audioTourName, // FIXED: Use the computed name instead of filename_text || null
              link_url: bubbleAudioTour.audiofile_file || null,
              active: bubbleAudioTour.approved__boolean ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessAudioTourRepo.save(newAudioTour);
            console.log(`✅ Created audio tour: ${audioTourName}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business audio tours from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business audio tours data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncBusinessesCSM() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business custom section media with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessCustomMediaApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessCustomMedia: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleCustomMedia of businessCustomMedia) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Custom Media Fields:',
            JSON.stringify(bubbleCustomMedia, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleCustomMedia.businesslinked_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleCustomMedia.businesslinked_custom_business} not found. Skipping custom media ${bubbleCustomMedia._id}.`,
            );
            continue;
          }

          // Use title if available, otherwise create default title
          const mediaTitle =
            bubbleCustomMedia.mediatitle_text &&
            bubbleCustomMedia.mediatitle_text.trim() !== ''
              ? bubbleCustomMedia.mediatitle_text
              : `Custom Media - ${bubbleCustomMedia._id}`;

          console.log(
            `Start Syncing Custom Media ${bubbleCustomMedia._id}, ${mediaTitle} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleCustomMedia['Created By'],
            )
          )?.id;

          // Find custom section by external_id if provided
          let customSectionId: string | undefined = undefined;
          if (bubbleCustomMedia.setionlinked_custom_customsection) {
            const customSection = await this.businessCustomSectionRepo.findOne({
              where: {
                external_id:
                  bubbleCustomMedia.setionlinked_custom_customsection,
              },
            });
            if (customSection) {
              customSectionId = customSection.id;
            } else {
              console.log(
                `⚠️ Custom section with external_id ${bubbleCustomMedia.setionlinked_custom_customsection} not found`,
              );
            }
          }

          // Check if this custom media already exists by external_id
          const existingCustomMedia =
            await this.businessCustomSectionMediaRepo.findOne({
              where: {
                external_id: bubbleCustomMedia._id,
              },
            });

          if (existingCustomMedia) {
            // Update existing custom media
            console.log(
              `✅ Custom Media already exists - Updating: ${mediaTitle}`,
            );
            existingCustomMedia.business_id = existingBusiness.id;
            if (customSectionId) {
              existingCustomMedia.business_custom_section_id = customSectionId;
            }
            existingCustomMedia.label = mediaTitle;
            existingCustomMedia.link = bubbleCustomMedia.medialink_text || null;
            existingCustomMedia.description =
              bubbleCustomMedia.mediadescription_text || null;
            existingCustomMedia.active =
              bubbleCustomMedia.approved__boolean ?? true;
            if (creatorUserId) {
              existingCustomMedia.modified_by = creatorUserId;
            }
            existingCustomMedia.modified_at = new Date();
            await this.businessCustomSectionMediaRepo.save(existingCustomMedia);
            console.log(`✅ Updated custom media: ${mediaTitle}`);
          } else {
            // Create new custom media
            console.log(
              `Creating new custom media: ${mediaTitle} for business ${existingBusiness.name}`,
            );
            let newCustomMedia = this.businessCustomSectionMediaRepo.create({
              external_id: bubbleCustomMedia._id,
              business_id: existingBusiness.id,
              business_custom_section_id: customSectionId,
              label: mediaTitle,
              link: bubbleCustomMedia.medialink_text || null,
              description: bubbleCustomMedia.mediadescription_text || null,
              active: bubbleCustomMedia.approved__boolean ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessCustomSectionMediaRepo.save(newCustomMedia);
            console.log(`✅ Created custom media: ${mediaTitle}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business custom media from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business custom media data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessesCS() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business custom sections with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessCustomSectionApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessCustomSections: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleCustomSection of businessCustomSections) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Custom Section Fields:',
            JSON.stringify(bubbleCustomSection, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleCustomSection.businesslinked_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleCustomSection.businesslinked_custom_business} not found. Skipping custom section ${bubbleCustomSection._id}.`,
            );
            continue;
          }

          // Use title if available, otherwise create default title
          const sectionTitle =
            bubbleCustomSection.sectiontitle_text &&
            bubbleCustomSection.sectiontitle_text.trim() !== ''
              ? bubbleCustomSection.sectiontitle_text
              : `Custom Section - ${bubbleCustomSection._id}`;

          console.log(
            `Start Syncing Custom Section ${bubbleCustomSection._id}, ${sectionTitle} for business ${existingBusiness.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleCustomSection['Created By'],
            )
          )?.id;

          // Check visibility - convert "Yes"/"No" to boolean
          const isVisible =
            bubbleCustomSection.visible__text?.toLowerCase() === 'yes';

          // Check if this custom section already exists by external_id
          const existingCustomSection =
            await this.businessCustomSectionRepo.findOne({
              where: {
                external_id: bubbleCustomSection._id,
              },
            });

          if (existingCustomSection) {
            // Update existing custom section
            console.log(
              `✅ Custom Section already exists - Updating: ${sectionTitle}`,
            );
            existingCustomSection.business_id = existingBusiness.id;
            existingCustomSection.label = sectionTitle;
            existingCustomSection.active = isVisible;
            if (creatorUserId) {
              existingCustomSection.modified_by = creatorUserId;
            }
            existingCustomSection.modified_at = new Date();
            await this.businessCustomSectionRepo.save(existingCustomSection);
            console.log(`✅ Updated custom section: ${sectionTitle}`);
          } else {
            // Create new custom section
            console.log(
              `Creating new custom section: ${sectionTitle} for business ${existingBusiness.name}`,
            );
            let newCustomSection = this.businessCustomSectionRepo.create({
              external_id: bubbleCustomSection._id,
              business_id: existingBusiness.id,
              label: sectionTitle,
              active: isVisible,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessCustomSectionRepo.save(newCustomSection);
            console.log(`✅ Created custom section: ${sectionTitle}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business custom sections from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business custom sections data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessesImages() {
    const response: any[] = [];

    // ✅ cache to avoid repeating DB hits
    const userCache = new Map<string, string | null>();
    const businessCache = new Map<string, any | null>(); // cache business by external_id

    const getUserId = async (externalUserId: string | null | undefined) => {
      if (!externalUserId) return null;
      if (userCache.has(externalUserId))
        return userCache.get(externalUserId) ?? null;

      const u = await this.userService.findOneByExternalId(externalUserId);
      const id = u?.id ?? null;
      userCache.set(externalUserId, id);
      return id;
    };

    const getBusinessByExternalId = async (externalBusinessId: string) => {
      if (!externalBusinessId) return null;
      if (businessCache.has(externalBusinessId))
        return businessCache.get(externalBusinessId) ?? null;

      const b = await this.businessService.findByExternalId(externalBusinessId);
      businessCache.set(externalBusinessId, b ?? null);
      return b ?? null;
    };

    try {
      let cursor = 0;
      let remaining = 1;

      while (remaining >= 1) {
        console.log(
          `Fetching business images with cursor: ${cursor} - ${remaining} remaining`,
        );

        const apiRes = await axios.get<any>(
          `${this.businessImagesApiUrl}?cursor=${cursor}&limit=100`,
          { headers: { Authorization: `Bearer ${this.apiToken}` } },
        );

        cursor = cursor === 0 ? 100 : cursor + 100;

        remaining = apiRes.data?.response?.remaining ?? 0;

        const data = apiRes.data as any;
        const businessImages: any[] =
          data?.response?.results ?? data?.response ?? [];

        // ✅ process page with concurrency=5
        await this.runWithConcurrency(
          businessImages,
          5,
          async (bubbleImage) => {
            try {
              const externalImageId = bubbleImage?._id;

              // Required title
              let title = bubbleImage?.imagetitle_text?.trim();

              if (!title) {
                title = `${bubbleImage?.business_name ?? 'Property Image'} Image`;
              }

              const externalBusinessId =
                bubbleImage?.businesslinked_custom_business;
              if (!externalBusinessId) {
                console.log(
                  `Skipping image ${externalImageId} - businesslinked_custom_business missing`,
                );
                return;
              }

              // ✅ business cached
              const existingBusiness =
                await getBusinessByExternalId(externalBusinessId);
              if (!existingBusiness) {
                console.log(
                  `Business with external_id ${externalBusinessId} not found. Skipping image ${externalImageId}.`,
                );
                return;
              }

              // ✅ user cached
              const creatorExternal = bubbleImage?.['Created By'];
              const creatorUserId = await getUserId(creatorExternal);

              // bubble image url (normalize using helper you updated)
              const bubbleUrlRaw = bubbleImage?.properyimage_image ?? null;
              const bubbleUrl = bubbleUrlRaw
                ? this.normalizeUrl(bubbleUrlRaw)
                : null;

              // ✅ Upload bubbleUrl -> S3 URL (and HEIC convert if needed)
              let finalUrl: string | null = null;

              if (bubbleUrl) {
                try {
                  finalUrl = await this.uploadBusinessImageToS3({
                    businessId: existingBusiness.id,
                    externalImageId,
                    bubbleUrl, // already normalized
                  });
                } catch (e: any) {
                  console.warn(
                    `Image upload failed for ${externalImageId}: ${e?.message || e}`,
                  );
                  finalUrl = bubbleUrl; // fallback (but normalized)
                }
              }

              // upsert by external_id
              const existingImage = await this.businessImagesRepo.findOne({
                where: { external_id: externalImageId },
              });

              if (existingImage) {
                await this.businessImagesRepo.update(existingImage.id, {
                  business_id: existingBusiness.id,
                  name: title,
                  description: bubbleImage?.imagedescription_text || null,
                  image_url: finalUrl,
                  active: bubbleImage?.approved__boolean ?? true,
                  modified_by: creatorUserId ?? existingImage.modified_by,
                  modified_at: new Date(),
                } as any);

                console.log(`✅ Updated image: ${title} (${externalImageId})`);
                return;
              }

              // ✅ create (external_id included directly)
              const newRow = this.businessImagesRepo.create({
                external_id: externalImageId,
                business_id: existingBusiness.id,
                name: title,
                description: bubbleImage?.imagedescription_text || null,
                tags: '', // if NOT NULL
                image_url: finalUrl,
                active: bubbleImage?.approved__boolean ?? true,
                created_by: creatorUserId ?? undefined,
                modified_by: creatorUserId ?? undefined,
              } as any);

              await this.businessImagesRepo.save(newRow);

              console.log(`✅ Created image: ${title} (${externalImageId})`);
            } catch (err: any) {
              console.error(
                `❌ Error processing bubble image ${bubbleImage?._id}:`,
                err?.message || err,
              );
            }
          },
        );

        response.push({ cursor, fetched: businessImages.length, remaining });
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business images from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business images data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  async SyncPartners() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching partners with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.partnerApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const partners: any[] = data?.response?.results ?? data?.response ?? [];

        for (const bubblePartner of partners) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Partner Fields:',
            JSON.stringify(bubblePartner, null, 2),
          );

          // Skip if name is empty (required field - no default)
          if (
            !bubblePartner.partnername_text ||
            bubblePartner.partnername_text.trim() === ''
          ) {
            console.log(
              `Skipping partner ${bubblePartner._id} - partnername is empty`,
            );
            continue;
          }

          console.log(
            `Start Syncing Partner ${bubblePartner._id}, ${bubblePartner.partnername_text}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubblePartner['Created By'],
            )
          )?.id;

          // Check if this partner already exists by external_id
          const existingPartner = await this.partnerRepo.findOne({
            where: {
              external_id: bubblePartner._id,
            },
          });

          if (existingPartner) {
            // Update existing partner
            console.log(
              `✅ Partner already exists - Updating: ${bubblePartner.partnername_text}`,
            );
            existingPartner.name = bubblePartner.partnername_text;
            existingPartner.description =
              bubblePartner.description_text || null;
            existingPartner.tags = bubblePartner.tags_text || null;
            existingPartner.image_url = bubblePartner.partnerlogo_image || null;
            existingPartner.web_url = bubblePartner.link_text || null;
            existingPartner.active = true;
            if (creatorUserId) {
              existingPartner.modified_by = creatorUserId;
            }
            existingPartner.modified_at = new Date();
            await this.partnerRepo.save(existingPartner);
            console.log(
              `✅ Updated partner: ${bubblePartner.partnername_text}`,
            );
          } else {
            // Create new partner
            console.log(
              `Creating new partner: ${bubblePartner.partnername_text}`,
            );
            let newPartner = this.partnerRepo.create({
              external_id: bubblePartner._id,
              name: bubblePartner.partnername_text,
              description: bubblePartner.description_text || null,
              tags: bubblePartner.tags_text || null,
              image_url: bubblePartner.partnerlogo_image || null,
              web_url: bubblePartner.link_text || null,
              active: true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.partnerRepo.save(newPartner);
            console.log(
              `✅ Created partner: ${bubblePartner.partnername_text}`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching partners from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble partners data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessPartners() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business partners with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessPartnersApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessPartners: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleBusinessPartner of businessPartners) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Business Partner Fields:',
            JSON.stringify(bubbleBusinessPartner, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleBusinessPartner.linkedbusiness_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleBusinessPartner.linkedbusiness_custom_business} not found. Skipping business partner ${bubbleBusinessPartner._id}.`,
            );
            continue;
          }

          // Find the partner by external_id
          let existingPartner = await this.partnerRepo.findOne({
            where: {
              external_id: bubbleBusinessPartner.partner_custom_partner,
            },
          });
          if (!existingPartner) {
            console.log(
              `Partner with external_id ${bubbleBusinessPartner.partner_custom_partner} not found. Skipping business partner ${bubbleBusinessPartner._id}.`,
            );
            continue;
          }

          console.log(
            `Start Syncing Business Partner ${bubbleBusinessPartner._id} for business ${existingBusiness.name} and partner ${existingPartner.name}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleBusinessPartner['Created By'],
            )
          )?.id;

          // Check if this business partner link already exists by external_id
          const existingBusinessPartner =
            await this.businessPartnersRepo.findOne({
              where: {
                external_id: bubbleBusinessPartner._id,
              },
            });

          if (existingBusinessPartner) {
            // Update existing business partner
            console.log(
              `✅ Business Partner already exists - Updating for business ${existingBusiness.name}`,
            );
            existingBusinessPartner.business_id = existingBusiness.id;
            existingBusinessPartner.partner = existingPartner; // Assign the partner entity, not just the ID
            existingBusinessPartner.active =
              bubbleBusinessPartner.approved__boolean ?? true;
            if (creatorUserId) {
              existingBusinessPartner.modified_by = creatorUserId;
            }
            existingBusinessPartner.modified_at = new Date();
            await this.businessPartnersRepo.save(existingBusinessPartner);
            console.log(`✅ Updated business partner link`);
          } else {
            // Create new business partner
            console.log(
              `Creating new business partner link for business ${existingBusiness.name}`,
            );
            let newBusinessPartner = this.businessPartnersRepo.create({
              external_id: bubbleBusinessPartner._id,
              business_id: existingBusiness.id,
              partner: existingPartner, // Assign the partner entity, not just the ID
              active: bubbleBusinessPartner.approved__boolean ?? true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessPartnersRepo.save(newBusinessPartner);
            console.log(`✅ Created business partner link`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business partners from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business partners data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncBusinessRecommendations() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business recommendations with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessRecommendationsApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessRecommendations: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleRecommendation of businessRecommendations) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Recommendation Fields:',
            JSON.stringify(bubbleRecommendation, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleRecommendation.linkedbusiness_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleRecommendation.linkedbusiness_custom_business} not found. Skipping recommendation ${bubbleRecommendation._id}.`,
            );
            continue;
          }

          // Find the user by external_id (optional - for logging)
          let existingUser = await this.userService.findOneByExternalId(
            bubbleRecommendation.linkeduser_user,
          );
          const userEmail = existingUser ? existingUser.email : 'Unknown User';

          console.log(
            `Start Syncing Recommendation ${bubbleRecommendation._id} for business ${existingBusiness.name} by user ${userEmail}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleRecommendation['Created By'],
            )
          )?.id;

          // Check if this recommendation already exists by external_id
          const existingRecommendation =
            await this.businessRecommendationsRepo.findOne({
              where: {
                external_id: bubbleRecommendation._id,
              },
            });

          if (existingRecommendation) {
            // Update existing recommendation
            console.log(
              `✅ Recommendation already exists - Updating for business ${existingBusiness.name}`,
            );
            existingRecommendation.business = existingBusiness; // Assign the business entity
            existingRecommendation.label =
              bubbleRecommendation.label_text || 'like';
            existingRecommendation.active = true;
            if (creatorUserId) {
              existingRecommendation.modified_by = creatorUserId;
            }
            existingRecommendation.modified_at = new Date();
            await this.businessRecommendationsRepo.save(existingRecommendation);
            console.log(`✅ Updated recommendation`);
          } else {
            // Create new recommendation
            console.log(
              `Creating new recommendation for business ${existingBusiness.name}`,
            );
            let newRecommendation = this.businessRecommendationsRepo.create({
              external_id: bubbleRecommendation._id,
              business: existingBusiness, // Assign the business entity
              label: bubbleRecommendation.label_text || 'like',
              active: true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessRecommendationsRepo.save(newRecommendation);
            console.log(`✅ Created recommendation`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business recommendations from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business recommendations data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncBusinessSchedule() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business schedules with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessScheduleApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessSchedules: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleSchedule of businessSchedules) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Schedule Fields:',
            JSON.stringify(bubbleSchedule, null, 2),
          );

          // Find the business by external_id
          let existingBusiness = await this.businessService.findByExternalId(
            bubbleSchedule.linkedbusiness_custom_business,
          );
          if (!existingBusiness) {
            console.log(
              `Business with external_id ${bubbleSchedule.linkedbusiness_custom_business} not found. Skipping schedule ${bubbleSchedule._id}.`,
            );
            continue;
          }

          console.log(
            `Start Syncing Schedule ${bubbleSchedule._id} for business ${existingBusiness.name} - ${bubbleSchedule.day_option_days_of_week}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleSchedule['Created By'],
            )
          )?.id;

          // Check if this schedule already exists by external_id
          const existingSchedule = await this.businessScheduleRepo.findOne({
            where: {
              external_id: bubbleSchedule._id,
            } as any, // Cast to any to bypass TypeScript error
          });

          if (existingSchedule) {
            // Update existing schedule
            console.log(
              `✅ Schedule already exists - Updating for ${bubbleSchedule.day_option_days_of_week}`,
            );
            existingSchedule.business = existingBusiness;
            existingSchedule.day = bubbleSchedule.day_option_days_of_week || '';
            // Only assign if value exists, otherwise keep existing or use placeholder date
            existingSchedule.opening_time = bubbleSchedule.openingtime_date
              ? new Date(bubbleSchedule.openingtime_date)
              : existingSchedule.opening_time;
            existingSchedule.closing_time = bubbleSchedule.closingtime_date
              ? new Date(bubbleSchedule.closingtime_date)
              : existingSchedule.closing_time;
            existingSchedule.opening_time_text =
              bubbleSchedule.openinghour_text || '';
            existingSchedule.closing_time_text =
              bubbleSchedule.closingtime_text || '';
            existingSchedule.active = true;
            if (creatorUserId) {
              existingSchedule.modified_by = creatorUserId;
            }
            existingSchedule.modified_at = new Date();
            await this.businessScheduleRepo.save(existingSchedule);
            console.log(
              `✅ Updated schedule for ${bubbleSchedule.day_option_days_of_week}`,
            );
          } else {
            // Create new schedule - skip if required date fields are missing
            if (
              !bubbleSchedule.openingtime_date ||
              !bubbleSchedule.closingtime_date
            ) {
              console.log(
                `⚠️ Skipping schedule for ${bubbleSchedule.day_option_days_of_week} - missing opening or closing time`,
              );
              continue;
            }

            console.log(
              `Creating new schedule for business ${existingBusiness.name} - ${bubbleSchedule.day_option_days_of_week}`,
            );
            let newSchedule = this.businessScheduleRepo.create({
              external_id: bubbleSchedule._id,
              business: existingBusiness,
              day: bubbleSchedule.day_option_days_of_week || '',
              opening_time: new Date(bubbleSchedule.openingtime_date),
              closing_time: new Date(bubbleSchedule.closingtime_date),
              opening_time_text: bubbleSchedule.openinghour_text || '',
              closing_time_text: bubbleSchedule.closingtime_text || '',
              active: true,
              created_by: creatorUserId || '',
              modified_by: creatorUserId || '',
            });
            await this.businessScheduleRepo.save(newSchedule);
            console.log(
              `✅ Created schedule for ${bubbleSchedule.day_option_days_of_week}`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business schedules from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business schedules data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncFeedback() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching feedback with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.feedbackApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const feedbacks: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleFeedback of feedbacks) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Feedback Fields:',
            JSON.stringify(bubbleFeedback, null, 2),
          );

          // Find feedback type by name/label (Bubble stores text value, not external_id)
          let feedbackTypeId: string | null = null;
          if (bubbleFeedback.feedbacktype_text) {
            const feedbackType = await this.feedbackTypeRepo.findOne({
              where: {
                name: bubbleFeedback.feedbacktype_text,
              },
            });
            if (feedbackType) {
              feedbackTypeId = feedbackType.id;
            } else {
              console.log(
                `⚠️ Feedback type '${bubbleFeedback.feedbacktype_text}' not found in database for feedback ${bubbleFeedback._id}`,
              );
            }
          }

          console.log(`Start Syncing Feedback ${bubbleFeedback._id}`);

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleFeedback['Created By'],
            )
          )?.id;

          // Check if this feedback already exists by external_id
          const existingFeedback = await this.feedbackRepo.findOne({
            where: {
              external_id: bubbleFeedback._id,
            },
          });

          if (existingFeedback) {
            // Update existing feedback
            console.log(`✅ Feedback already exists - Updating`);
            if (feedbackTypeId)
              existingFeedback.feedback_type_id = feedbackTypeId;
            existingFeedback.comment = bubbleFeedback.comments_text || '';
            existingFeedback.approved_at = bubbleFeedback.approvedat_date
              ? new Date(bubbleFeedback.approvedat_date)
              : new Date();
            existingFeedback.active = true;
            if (creatorUserId) {
              existingFeedback.modified_by = creatorUserId;
            }
            existingFeedback.modified_at = new Date();
            await this.feedbackRepo.save(existingFeedback);
            console.log(`✅ Updated feedback`);
          } else {
            // Create new feedback - skip if no feedback_type_id
            if (!feedbackTypeId) {
              console.log(
                `⚠️ Skipping feedback ${bubbleFeedback._id} - missing feedback type`,
              );
              continue;
            }
            console.log(`Creating new feedback`);
            let newFeedback = this.feedbackRepo.create({
              external_id: bubbleFeedback._id,
              feedback_type_id: feedbackTypeId,
              comment: bubbleFeedback.comments_text || '',
              approved_at: bubbleFeedback.approvedat_date
                ? new Date(bubbleFeedback.approvedat_date)
                : new Date(),
              active: true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.feedbackRepo.save(newFeedback);
            console.log(`✅ Created feedback`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching feedback from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble feedback data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncBusinessReviews() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching business reviews with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.businessReviewsApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const businessReviews: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleReview of businessReviews) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Review Fields:',
            JSON.stringify(bubbleReview, null, 2),
          );

          // Find the business by external_id
          let businessId: string | null = null;
          if (bubbleReview.businesslinked_custom_business) {
            const existingBusiness =
              await this.businessService.findByExternalId(
                bubbleReview.businesslinked_custom_business,
              );
            if (existingBusiness) {
              businessId = existingBusiness.id;
            } else {
              console.log(
                `⚠️ Business with external_id ${bubbleReview.businesslinked_custom_business} not found for review ${bubbleReview._id}`,
              );
            }
          }

          // Find review type by title/name - reviewoptions_x_list_text is an array, use first value
          let reviewTypeId: string | null = null;
          if (
            Array.isArray(bubbleReview.reviewoptions_x_list_text) &&
            bubbleReview.reviewoptions_x_list_text.length > 0
          ) {
            const reviewTypeTitle = bubbleReview.reviewoptions_x_list_text[0];
            const reviewType = await this.reviewTypeRepo.findOne({
              where: {
                title: reviewTypeTitle,
              },
            });
            if (reviewType) {
              reviewTypeId = reviewType.id;
            } else {
              console.log(
                `⚠️ Review type '${reviewTypeTitle}' not found in database for review ${bubbleReview._id}`,
              );
            }
          }

          console.log(`Start Syncing Review ${bubbleReview._id}`);

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleReview['Created By'],
            )
          )?.id;

          // Check if this review already exists by external_id
          const existingReview = await this.businessReviewsRepo.findOne({
            where: {
              external_id: bubbleReview._id,
            },
          });

          if (existingReview) {
            // Update existing review
            console.log(`✅ Review already exists - Updating`);
            if (businessId) existingReview.business_id = businessId;
            if (reviewTypeId) existingReview.review_type_id = reviewTypeId;
            existingReview.description =
              bubbleReview.reviewdescripion_text || '';
            existingReview.approved =
              bubbleReview.recommended__boolean ?? false;
            existingReview.approvedAt = bubbleReview.approveddate_date
              ? new Date(bubbleReview.approveddate_date)
              : new Date();
            existingReview.image_url = bubbleReview.reviewimages_image || '';
            existingReview.active = true;
            if (creatorUserId) {
              existingReview.modified_by = creatorUserId;
            }
            existingReview.modified_at = new Date();
            await this.businessReviewsRepo.save(existingReview);
            console.log(`✅ Updated review`);
          } else {
            // Create new review - skip if no business_id or review_type_id
            if (!businessId || !reviewTypeId) {
              console.log(
                `⚠️ Skipping review ${bubbleReview._id} - missing business or review type`,
              );
              continue;
            }
            console.log(`Creating new review`);
            let newReview = this.businessReviewsRepo.create({
              external_id: bubbleReview._id,
              business_id: businessId,
              review_type_id: reviewTypeId,
              description: bubbleReview.reviewdescripion_text || '',
              approved: bubbleReview.recommended__boolean ?? false,
              approvedAt: bubbleReview.approveddate_date
                ? new Date(bubbleReview.approveddate_date)
                : new Date(),
              image_url: bubbleReview.reviewimages_image || '',
              active: true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.businessReviewsRepo.save(newReview);
            console.log(`✅ Created review`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching business reviews from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble business reviews data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }

  async SyncCoupons() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching coupons with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.couponsApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const coupons: any[] = data?.response?.results ?? data?.response ?? [];

        for (const bubbleCoupon of coupons) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Coupon Fields:',
            JSON.stringify(bubbleCoupon, null, 2),
          );

          console.log(
            `Start Syncing Coupon ${bubbleCoupon._id}, ${bubbleCoupon.code_text}`,
          );

          // Get creator user id
          let creatorUserId = (
            await this.userService.findOneByExternalId(
              bubbleCoupon['Created By'],
            )
          )?.id;

          // Check if this coupon already exists by external_id
          const existingCoupon = await this.couponsRepo.findOne({
            where: {
              external_id: bubbleCoupon._id,
            },
          });

          if (existingCoupon) {
            // Update existing coupon
            console.log(
              `✅ Coupon already exists - Updating: ${bubbleCoupon.code_text}`,
            );
            existingCoupon.code = bubbleCoupon.code_text || '';
            existingCoupon.name = bubbleCoupon.name_text || '';
            existingCoupon.validitymonths =
              bubbleCoupon.expiry_number?.toString() || '0';
            existingCoupon.discount =
              bubbleCoupon.discountamount_number?.toString() || '0';
            existingCoupon.stripe_coupon_id =
              bubbleCoupon.stripecouponid_text || null;
            existingCoupon.stripe_promo_code_id =
              bubbleCoupon.stripepromocodeid_text || null;
            existingCoupon.active = true;
            if (creatorUserId) {
              existingCoupon.modified_by = creatorUserId;
            }
            existingCoupon.modified_at = new Date();
            await this.couponsRepo.save(existingCoupon);
            console.log(`✅ Updated coupon: ${bubbleCoupon.code_text}`);
          } else {
            // Create new coupon
            console.log(`Creating new coupon: ${bubbleCoupon.code_text}`);
            let newCoupon = this.couponsRepo.create({
              external_id: bubbleCoupon._id,
              code: bubbleCoupon.code_text || '',
              name: bubbleCoupon.name_text || '',
              validitymonths: bubbleCoupon.expiry_number?.toString() || '0',
              discount: bubbleCoupon.discountamount_number?.toString() || '0',
              stripe_coupon_id: bubbleCoupon.stripecouponid_text || null,
              stripe_promo_code_id: bubbleCoupon.stripepromocodeid_text || null,
              active: true,
              created_by: creatorUserId,
              modified_by: creatorUserId,
            });
            await this.couponsRepo.save(newCoupon);
            console.log(`✅ Created coupon: ${bubbleCoupon.code_text}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching coupons from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble coupons data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
  async SyncSubscriptions() {
    let response = [];
    try {
      let cursor = 0;
      let remaining = 1;
      while (remaining >= 1) {
        console.log(
          `Fetching subscriptions with cursor: ${cursor} - ${remaining} remaining`,
        );
        const response = await axios.get<any>(
          `${this.subscriptionsApiUrl}?cursor=${cursor}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        );
        if (cursor === 0) {
          cursor = 100;
        } else {
          cursor = cursor + 100;
        }

        remaining = response.data.response.remaining;
        console.log(response.data);

        // Normalize potential shapes: { response: { results: [...] } } or { response: [...] }
        const data = response.data as any;
        const subscriptions: any[] =
          data?.response?.results ?? data?.response ?? [];

        for (const bubbleSubscription of subscriptions) {
          // DEBUG: Print exact field names from Bubble
          console.log(
            'Bubble Subscription Fields:',
            JSON.stringify(bubbleSubscription, null, 2),
          );

          // Find user by external_id
          let userId: string | null = null;
          if (bubbleSubscription.relateduser_user) {
            const existingUser = await this.userService.findOneByExternalId(
              bubbleSubscription.relateduser_user,
            );
            if (existingUser) {
              userId = existingUser.id;
            } else {
              console.log(
                `⚠️ User with external_id ${bubbleSubscription.relateduser_user} not found for subscription ${bubbleSubscription._id}`,
              );
            }
          }

          // Find business by external_id (optional)
          let businessId: string | null = null;
          if (bubbleSubscription.businesslinked_custom_business) {
            const existingBusiness =
              await this.businessService.findByExternalId(
                bubbleSubscription.businesslinked_custom_business,
              );
            if (existingBusiness) {
              businessId = existingBusiness.id;
            }
          }

          // Skip if no user_id
          if (!userId) {
            console.log(
              `⚠️ Skipping subscription ${bubbleSubscription._id} - missing user`,
            );
            continue;
          }

          console.log(`Start Syncing Subscription ${bubbleSubscription._id}`);

          // Check if this subscription already exists by external_id
          const existingSubscription = await this.subscriptionsRepo.findOne({
            where: {
              external_id: bubbleSubscription._id,
            },
          });

          if (existingSubscription) {
            // Update existing subscription
            console.log(`✅ Subscription already exists - Updating`);
            existingSubscription.user_id = userId;
            existingSubscription.business_id = businessId;
            existingSubscription.amount =
              bubbleSubscription.amount_number?.toString() || '0';
            existingSubscription.packageName =
              bubbleSubscription.package1_option_subscription_plan || 'monthly';
            existingSubscription.priceId =
              bubbleSubscription.PriceId_text || '';
            existingSubscription.start_date = bubbleSubscription.startdate_date
              ? new Date(bubbleSubscription.startdate_date)
              : undefined;
            existingSubscription.end_date = bubbleSubscription.enddate_date
              ? new Date(bubbleSubscription.enddate_date)
              : undefined;
            existingSubscription.discount_code =
              bubbleSubscription.DiscountCode_text || undefined;
            existingSubscription.discount_amount =
              bubbleSubscription.DiscountAmount_number?.toString() || '0';
            existingSubscription.stripe_subscription_id =
              bubbleSubscription.subid_text || undefined;
            existingSubscription.status =
              bubbleSubscription.status_text || 'pending';
            existingSubscription.payment_reference =
              bubbleSubscription.PaymentReference_text || undefined;
            existingSubscription.invoice_id =
              bubbleSubscription.invoicelink_text || undefined;
            existingSubscription.success_at = bubbleSubscription.SuccessAt_date
              ? new Date(bubbleSubscription.SuccessAt_date)
              : undefined;
            existingSubscription.cancel_at = bubbleSubscription.CancelAt_date
              ? new Date(bubbleSubscription.CancelAt_date)
              : undefined;
            existingSubscription.updated_at = new Date();
            await this.subscriptionsRepo.save(existingSubscription);
            console.log(`✅ Updated subscription`);
          } else {
            // Create new subscription
            console.log(`Creating new subscription`);
            let newSubscription = this.subscriptionsRepo.create({
              external_id: bubbleSubscription._id,
              user_id: userId,
              business_id: businessId,
              amount: bubbleSubscription.amount_number?.toString() || '0',
              packageName:
                bubbleSubscription.package1_option_subscription_plan ||
                'monthly',
              priceId: bubbleSubscription.PriceId_text || '',
              start_date: bubbleSubscription.startdate_date
                ? new Date(bubbleSubscription.startdate_date)
                : undefined,
              end_date: bubbleSubscription.enddate_date
                ? new Date(bubbleSubscription.enddate_date)
                : undefined,
              discount_code: bubbleSubscription.DiscountCode_text || undefined,
              discount_amount:
                bubbleSubscription.DiscountAmount_number?.toString() || '0',
              stripe_subscription_id:
                bubbleSubscription.subid_text || undefined,
              status: bubbleSubscription.status_text || 'pending',
              payment_reference:
                bubbleSubscription.PaymentReference_text || undefined,
              invoice_id: bubbleSubscription.invoicelink_text || undefined,
              success_at: bubbleSubscription.SuccessAt_date
                ? new Date(bubbleSubscription.SuccessAt_date)
                : undefined,
              cancel_at: bubbleSubscription.CancelAt_date
                ? new Date(bubbleSubscription.CancelAt_date)
                : undefined,
            });
            await this.subscriptionsRepo.save(newSubscription);
            console.log(`✅ Created subscription`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Error fetching subscriptions from Bubble:',
        (error as any).response?.data || error,
      );
      throw new HttpException(
        'Failed to fetch Bubble subscriptions data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response;
  }
}
