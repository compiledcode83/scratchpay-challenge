import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as JSONStream from 'JSONStream';
import { SearchClinicDto } from './dto/search-clinic.dto';
import { stateData } from '../assets/stateData';

@Injectable()
export class ClinicService {
  private readonly DENTAL_CLINICS_URL =
    'https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json';
  private readonly VET_CLINICS_URL =
    'https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json';

  async searchClinics(query: SearchClinicDto): Promise<any[]> {
    const dentalPromise = new Promise<any[]>((resolve, reject) => {
      const results: any[] = [];
      axios
        .get(this.DENTAL_CLINICS_URL, { responseType: 'stream' })
        .then((res) => {
          res.data
            .pipe(JSONStream.parse('*'))
            .on('data', (data: any) => {
              if (this.clinicMatchesSearchCriteria(data, query, 'dental')) {
                results.push({
                  name: data.name,
                  state: data.stateName,
                  time: {
                    from: data.availability.from,
                    to: data.availability.to,
                  },
                });
              }
            })
            .on('end', () => {
              resolve(results);
            })
            .on('error', (err: any) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });

    const vetPromise = new Promise<any[]>((resolve, reject) => {
      const results: any[] = [];
      axios
        .get(this.VET_CLINICS_URL, { responseType: 'stream' })
        .then((res) => {
          res.data
            .pipe(JSONStream.parse('*'))
            .on('data', (data: any) => {
              if (this.clinicMatchesSearchCriteria(data, query, 'vet')) {
                results.push({
                  name: data.clinicName,
                  state: data.stateCode,
                  time: {
                    from: data.opening.from,
                    to: data.opening.to,
                  },
                });
              }
            })
            .on('end', () => {
              resolve(results);
            })
            .on('error', (err: any) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });

    const [dentalResult, vetResult] = await Promise.all([dentalPromise, vetPromise]);

    return [...dentalResult, ...vetResult];
  }

  private clinicMatchesSearchCriteria(clinic: any, query: SearchClinicDto, type: string): boolean {
    if (type === 'dental') {
      if ('name' in query && !this.isStringContained(clinic.name, query.name)) {
        return false;
      }
      if ('state' in query && !this.isStateContained('name', clinic.stateName, query.state)) {
        return false;
      }
      if ('from' in query && !this.isTimeWithinRange(clinic.availability, query.from, query.to)) {
        return false;
      }
    }

    if (type === 'vet') {
      if ('name' in query && !this.isStringContained(clinic.clinicName, query.name)) {
        return false;
      }
      if ('state' in query && !this.isStateContained('code', clinic.stateCode, query.state)) {
        return false;
      }
      if ('from' in query && !this.isTimeWithinRange(clinic.opening, query.from, query.to)) {
        return false;
      }
    }

    return true;
  }

  private isStringContained(name: string, query: string): boolean {
    return name.toLowerCase().includes(query.toLowerCase());
  }

  private isStateContained(type: string, state: string, query: string): boolean {
    console.log({ state });
    console.log({ query });
    const selectedState = stateData.find((item: any) => item[type] === state);

    if (
      this.isStringContained(selectedState.name, query) ||
      this.isStringContained(selectedState.code, query)
    ) {
      return true;
    }

    return false;
  }

  private isTimeWithinRange(opening: any, from: string, to: string): boolean {
    if (opening.from.localeCompare(from) === 1 || opening.to.localeCompare(to) === -1) {
      return false;
    } else {
      return true;
    }
  }

  getPrivateFunctions() {
    return {
      clinicMatchesSearchCriteria: this.clinicMatchesSearchCriteria.bind(this),
      isStringContained: this.isStringContained.bind(this),
      isStateContained: this.isStateContained.bind(this),
      isTimeWithinRange: this.isTimeWithinRange.bind(this),
    };
  }
}
