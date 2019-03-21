import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'seasonRank'})
export class SeasonRankPipe implements PipeTransform {

  transform(exp: number): string {
    // Might be a good idea to determine a formula instead of putting ranges
    switch (true) {
        case (exp >= 1 && exp < 20) :
          return 'Rank 1';
        case (exp >= 20 && exp < 50):
          return 'Rank 2';
        case (exp >= 50 && exp < 90):
          return 'Rank 3';
        case (exp >= 90 && exp < 150):
          return 'Rank 4';
        case (exp >= 150):
          return 'Rank 5';
        default:
          return 'Unranked';
    }
  }
}
