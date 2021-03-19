import { pluralize, entityPluralizations } from './pluralization';
import type { Slide, VoteSlide } from './task1';
import type { Entity, UserId, User } from './entities';


export function prepareData(entities: Entity[], { sprintId }: { sprintId: number }): Slide[] {
  const users = new Map<UserId, User>();
  const likes = new Map<UserId, number>();

  for (const entity of entities) {
    if (entity.type === 'Comment') {
      const likeAmount = entity.likes.length;
      const authorId = typeof entity.author === 'number' ? entity.author : entity.author.id;
      likes.set(authorId, likes.get(authorId) + likeAmount);
    } else if (entity.type === 'User') {
      users.set(entity.id, entity);
    }
  }

  const voteSlide: VoteSlide = {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: `Спринт № ${sprintId}`,
      emoji: '🔎',
      users: [...likes.entries()].map(([id, likes]) => {
        const user = users.get(id);
        return {
          id,
          name: user.name,
          avatar: user.avatar,
          valueText: pluralize(likes, entityPluralizations.votes),
        }
      }),
    },
  };

  return [voteSlide];
}
