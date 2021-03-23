import { pluralize, entityPluralizations } from '../utils/pluralization';
import { byMapValueDesc } from '../utils/comparators';
import type { VoteSlide } from '../task1';
import type { Sprint, User, UserId } from '../entities';

export default function buildVoteSlide(
  currentSprint: Sprint,
  likesThisSprint: Map<UserId, number>,
  users: Map<UserId, User>,
): VoteSlide {
  const usersRankedByLikes = [...likesThisSprint.entries()];
  usersRankedByLikes.sort(byMapValueDesc);
  return {
    alias: 'vote',
    data: {
      title: 'Самый 🔎 внимательный разработчик',
      subtitle: currentSprint.name,
      emoji: '🔎',
      users: usersRankedByLikes.map(([id, likeCount]) => {
        const user = users.get(id);
        return {
          id,
          name: user.name,
          avatar: user.avatar,
          valueText: pluralize(likeCount, entityPluralizations.votes),
        }
      }),
    },
  };
}
