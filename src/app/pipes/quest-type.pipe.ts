import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'questType'
})
export class QuestTypePipe implements PipeTransform {

  transform(type: QuestType): string {
    switch (type) {
      case QuestType.ADDITIONAL:
        return 'Additional';

      case QuestType.REQUIRED:
        return 'Required';

      case QuestType.SPECIAL:
        return 'Special';

      default:
        return '';
    }
  }
}
