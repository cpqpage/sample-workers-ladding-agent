import { BaseDao } from './BaseDao';
import { Resource } from '$model/schema';

export class ResourceDao extends BaseDao<typeof Resource> {
    constructor() {
        super(Resource);
    }
}