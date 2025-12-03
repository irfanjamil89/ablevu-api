import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleMapsService {
  private readonly geocodeUrl =
    'https://maps.googleapis.com/maps/api/geocode/json';

  private readonly placesAutocompleteUrl =
    'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  private readonly placeDetailsUrl =
    'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get apiKey(): string {
    const key = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'Google Maps API key is not configured',
      );
    }
    return key;
  }

  // ✅ 1) Geocode: address -> lat/lng + full details
  async geocodeAddress(address: string): Promise<any> {
    if (!address) {
      throw new BadRequestException('Address is required');
    }

    try {
      const response$ = this.httpService.get(this.geocodeUrl, {
        params: {
          address,
          key: this.apiKey,
        },
      });

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('Error geocoding address:', error?.message || error);
      throw new InternalServerErrorException('Failed to geocode address');
    }
  }

  // ✅ 2) Reverse Geocode: lat/lng -> address
  async reverseGeocode(lat: number, lng: number): Promise<any> {
    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    try {
      const response$ = this.httpService.get(this.geocodeUrl, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
      });

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('Error reverse geocoding:', error?.message || error);
      throw new InternalServerErrorException('Failed to reverse geocode');
    }
  }

  // ✅ 3) Places Autocomplete: input text -> suggestions
  async autocomplete(input: string): Promise<any> {
    if (!input) {
      throw new BadRequestException('Input is required');
    }

    try {
      const response$ = this.httpService.get(this.placesAutocompleteUrl, {
        params: {
          input,
          key: this.apiKey,
          // optional: restrict country, types etc.
          // types: 'address',
          // components: 'country:us|country:pk',
        },
      });

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('Error in autocomplete:', error?.message || error);
      throw new InternalServerErrorException('Failed to autocomplete address');
    }
  }

  // ✅ 4) Place Details: placeId -> detailed info (including lat/lng)
  async getPlaceDetails(placeId: string): Promise<any> {
    if (!placeId) {
      throw new BadRequestException('placeId is required');
    }

    try {
      const response$ = this.httpService.get(this.placeDetailsUrl, {
        params: {
          place_id: placeId,
          key: this.apiKey,
        },
      });

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error?.message || error);
      throw new InternalServerErrorException('Failed to get place details');
    }
  }
}
