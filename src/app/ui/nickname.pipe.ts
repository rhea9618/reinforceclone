import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nickname'
})
export class NicknamePipe implements PipeTransform {

  transform(fullName: string): string {
    const nameWords = fullName.split(' ');
    return `${nameWords[0]} ${nameWords[1]}`;
  }
}
