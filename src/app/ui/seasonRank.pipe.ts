import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'seasonRank'})
export class SeasonRankPipe implements PipeTransform {

    transform(exp: number): string {
        if (exp < 1) {
          return 'Unranked';
        } else if (exp < 20) {
          return 'Rank 1';
        } else if (exp < 50) {
          return 'Rank 2';
        } else if (exp < 90) {
          return 'Rank 3';
        } else if (exp < 150) {
          return 'Rank 4';
        } else {
          return 'Rank 5';
        }
      }
}
