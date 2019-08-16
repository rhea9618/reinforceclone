import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'questPoints'})
export class QuestPointsPipe implements PipeTransform {

  transform(quest: Partial<PlayerQuest>): number {
    const type = quest.type;
    const required = quest.required;

    switch (type) {
      case QuestType.ADDITIONAL:
        return 5;

      case QuestType.REQUIRED:
        return 10;

      case QuestType.SPECIAL:
        return 20;

      default:
        return required ? 10 : 5;
    }
  }

}
