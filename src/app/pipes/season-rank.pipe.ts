import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'seasonRank' })
export class SeasonRankPipe implements PipeTransform {

  transform(exp: number): string {
    // Might be a good idea to determine a formula instead of putting ranges
    switch (true) {
      case (exp >= 1 && exp <= 40):
        return 'Nebula';
      case (exp > 40 && exp <= 150):
        return 'Star';
      case (exp > 150 && exp <= 300):
        return 'Red Giant';
      case (exp > 300 && exp <= 500):
        return 'Supernova';
      case (exp > 500):
        return 'Neutron';
      default:
        return 'Unranked';
    }
  }
}
