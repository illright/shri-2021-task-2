import type { Entity } from '../entities';

/** A custom type guard to determine whether a certain object is an Entity. */
function isEntity<T extends Entity>(arg: T | T['id']): arg is T {
  return typeof arg === 'object' && 'id' in arg && 'type' in arg;
}

/** A generic function of unwrapping an entity to its ID if it's not an ID already. */
export default function getID<T extends Entity>(entityOrID: T | T['id']): T['id'] {
  return isEntity(entityOrID) ? entityOrID.id : entityOrID;
}
