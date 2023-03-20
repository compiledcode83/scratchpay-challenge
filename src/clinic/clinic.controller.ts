import { Controller, Get, Query } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { SearchClinicDto } from './dto/search-clinic.dto';

@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  async searchClinics(@Query() query: SearchClinicDto) {
    return this.clinicService.searchClinics(query);
  }
}
