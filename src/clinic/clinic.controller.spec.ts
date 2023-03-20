import { Test, TestingModule } from '@nestjs/testing';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { SearchClinicDto } from './dto/search-clinic.dto';

describe('ClinicController', () => {
  let controller: ClinicController;
  let service: ClinicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicController],
      providers: [ClinicService],
    }).compile();

    controller = module.get<ClinicController>(ClinicController);
    service = module.get<ClinicService>(ClinicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchClinics', () => {
    const query: SearchClinicDto = {
      name: 'test',
      state: 'CA',
      from: '08:00',
      to: '16:00',
    };

    it('should call the searchClinics method of the clinicService with the correct arguments', async () => {
      const searchClinicsSpy = jest.spyOn(service, 'searchClinics').mockResolvedValue([]);
      await controller.searchClinics(query);
      expect(searchClinicsSpy).toHaveBeenCalledWith(query);
    });

    it('should return an array of clinics that match the search criteria', async () => {
      const clinics = [
        {
          name: 'Test Clinic',
          stateCode: 'CA',
          availability: { from: '08:00', to: '16:00' },
        },
      ];
      jest.spyOn(service, 'searchClinics').mockResolvedValue(clinics);
      const result = await controller.searchClinics(query);
      expect(result).toEqual(clinics);
    });
  });
});
