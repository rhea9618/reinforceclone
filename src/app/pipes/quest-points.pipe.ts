import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'questPoints'})
export class QuestPointsPipe implements PipeTransform {

  transform(type: QuestType): number {
    switch (type) {
      case QuestType.ADDITIONAL:
        return 5;

      case QuestType.REQUIRED:
        return 10;

      case QuestType.SPECIAL:
        return 20;

      default:
        return 0;
    }
  }
}
