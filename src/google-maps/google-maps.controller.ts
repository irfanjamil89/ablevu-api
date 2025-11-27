import { Controller, Get, Query } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { GeocodeQueryDto } from './geocode-query.dto';
import { ReverseGeocodeQueryDto } from './reverse-geocode-query.dto';
import { AutocompleteQueryDto } from './autocomplete-query.dto';
import { PlaceDetailsQueryDto } from './place-details-query.dto';

@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  // GET /google-maps/geocode?address=...
  @Get('geocode')
  async geocode(@Query() query: GeocodeQueryDto) {
    return this.googleMapsService.geocodeAddress(query.address);
  }

  // GET /google-maps/reverse-geocode?lat=..&lng=..
  @Get('reverse-geocode')
  async reverseGeocode(@Query() query: ReverseGeocodeQueryDto) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    return this.googleMapsService.reverseGeocode(lat, lng);
  }

  // GET /google-maps/autocomplete?input=...
  @Get('autocomplete')
  async autocomplete(@Query() query: AutocompleteQueryDto) {
    return this.googleMapsService.autocomplete(query.input);
  }

  // GET /google-maps/place-details?placeId=...
  @Get('place-details')
  async placeDetails(@Query() query: PlaceDetailsQueryDto) {
    return this.googleMapsService.getPlaceDetails(query.placeId);
  }
}
