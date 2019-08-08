import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'questPoints'})
export class QuestPointsPipe implements PipeTransform {

  transform(quest: PlayerQuest): number {
    const type = quest.type;
    const required = quest.required;

    switch (type) {
      case QuestType.ADDITIONAL:
        return PointsByQuestType.ADDITIONAL;

      case QuestType.REQUIRED:
        return PointsByQuestType.REQUIRED;

      case QuestType.SPECIAL:
        return PointsByQuestType.SPECIAL;

      default:
        return required ? 10 : 5;
    }
  }

}
