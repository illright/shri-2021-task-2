import type { Entity } from '../entities';

function isEntity<T extends Entity>(arg: T | T['id']): arg is T {
  return typeof arg === 'object' && 'id' in arg && 'type' in arg;
}

export default function getID<T extends Entity>(entityOrID: T | T['id']): T['id'] {
  return isEntity(entityOrID) ? entityOrID.id : entityOrID;
}
