import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PlatformEnquiriesService } from '../services/platform-enquiries.service';
import { CreatePublicEnquiryRequest } from '@solaros/contracts';

@Controller('enquiries')
export class PublicEnquiriesController {
  constructor(private readonly enquiriesService: PlatformEnquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitEnquiry(@Body() dto: CreatePublicEnquiryRequest, @Req() req: Request) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || undefined;
    return await this.enquiriesService.submitPublicEnquiry(dto, ipAddress);
  }
}
