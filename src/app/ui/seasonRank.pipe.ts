import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'seasonRank'})
export class SeasonRankPipe implements PipeTransform {

    transform(exp: number): number {
        if (exp < 1) {
          return 0;
        } else if (exp < 20) {
          return 1;
        } else if (exp < 50) {
          return 2;
        } else if (exp < 90) {
          return 3;
        } else if (exp < 150) {
          return 4;
        } else {
          return 5;
        }
      }
}
