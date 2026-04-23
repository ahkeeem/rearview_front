import { users } from './users';
import { connections } from './connections';
import { reviews } from './reviews';
import { conversations } from './conversations';
import { messages } from './messages';
import { feed } from './feed';
import { entities } from './entities';
import { threads } from './threads';
import { payments } from './payments';
import { escrow } from './escrow';
import { barter } from './barter';
import { trustLinks } from './trustLinks';
import { admin } from './admin';

const api = {
  users,
  connections,
  reviews,
  conversations,
  messages,
  feed,
  entities,
  threads,
  payments,
  escrow,
  barter,
  trustLinks,
  admin
};

export default api;
