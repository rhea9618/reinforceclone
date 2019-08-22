import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nickname'
})
export class NicknamePipe implements PipeTransform {

  transform(fullName: string): string {
    if (!fullName) {
      return '';
    }

    if (fullName.indexOf(' ') < 0) {
      return fullName;
    }

    const nameWords = fullName.split(' ');
    return `${nameWords[0]} ${nameWords[1]}`;
  }
}
