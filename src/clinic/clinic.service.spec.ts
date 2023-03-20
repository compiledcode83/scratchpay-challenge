import { Test, TestingModule } from '@nestjs/testing';
import { ClinicService } from './clinic.service';
import { SearchClinicDto } from './dto/search-clinic.dto';
import { stateData } from '../assets/stateData';

describe('ClinicService', () => {
  let service: ClinicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicService],
    }).compile();

    service = module.get<ClinicService>(ClinicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchClinics', () => {
    const query: SearchClinicDto = {
      name: 'test',
      state: 'CA',
      from: '08:00',
      to: '16:00',
    };

    it('should return an empty array if no clinics match the search criteria', async () => {
      const result = await service.searchClinics({
        name: 'foobar',
        state: 'TX',
        from: '10:00',
        to: '14:00',
      });
      expect(result).toEqual([]);
    });

    it('should return an array of clinics that match the search criteria', async () => {
      const result = await service.searchClinics(query);
      console.log({ result });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((clinic) => {
        expect(clinic.name.toLowerCase()).toContain(query.name.toLowerCase());
        expect(clinic.state).toMatch(/^CA$|^California$/);
        expect(
          service.getPrivateFunctions().isTimeWithinRange(clinic.time, query.from, query.to),
        ).toBeTruthy();
      });
    });
  });

  describe('clinicMatchesSearchCriteria', () => {
    it('should return true if the clinic matches the search criteria', () => {
      const clinic = {
        name: 'Test Clinic',
        stateName: 'California',
        availability: {
          from: '08:00',
          to: '16:00',
        },
      };
      const query: SearchClinicDto = {
        name: 'test',
        state: 'CA',
        from: '08:00',
        to: '16:00',
      };
      const result = service
        .getPrivateFunctions()
        .clinicMatchesSearchCriteria(clinic, query, 'dental');
      expect(result).toBeTruthy();
    });

    it('should return false if the clinic does not match the search criteria', () => {
      const clinic = {
        name: 'Test Clinic',
        stateName: 'California',
        availability: {
          from: '08:00',
          to: '16:00',
        },
      };
      const query: SearchClinicDto = {
        name: 'foobar',
        state: 'TX',
        from: '10:00',
        to: '14:00',
      };
      const result = service
        .getPrivateFunctions()
        .clinicMatchesSearchCriteria(clinic, query, 'dental');
      expect(result).toBeFalsy();
    });
  });

  describe('isStringContained', () => {
    it('should return true if the string contains the query', () => {
      const result = service.getPrivateFunctions().isStringContained('Test String', 'test');
      expect(result).toBeTruthy();
    });

    it('should return false if the string does not contain the query', () => {
      const result = service.getPrivateFunctions().isStringContained('Test String', 'foobar');
      expect(result).toBeFalsy();
    });
  });

  describe('isStateContained', () => {
    it('should return true if the state name contains the query', () => {
      const result = service.getPrivateFunctions().isStateContained('name', 'California', 'calif');
      expect(result).toBeTruthy();
    });

    it('should return true if the state code contains the query', () => {
      const result = service.getPrivateFunctions().isStateContained('code', 'CA', 'ca');
      expect(result).toBeTruthy();
    });

    it('should return false if the state does not contain the query', () => {
      const result = service.getPrivateFunctions().isStateContained('name', 'California', 'texas');
      expect(result).toBeFalsy();
    });
  });

  describe('isTimeWithinRange', () => {
    it('should return true if the specified time is within the clinic opening hours', () => {
      const opening = {
        from: '08:00',
        to: '16:00',
      };
      const result = service.getPrivateFunctions().isTimeWithinRange(opening, '10:00', '14:00');
      expect(result).toBeTruthy();
    });

    it('should return false if the specified time is outside the clinic opening hours', () => {
      const opening = {
        from: '08:00',
        to: '16:00',
      };
      const result = service.getPrivateFunctions().isTimeWithinRange(opening, '07:00', '17:00');
      expect(result).toBeFalsy();
    });
  });
});
