import { MapperInterface } from './mapper';

export default class Print implements MapperInterface {
    filter() { return true; }
    map(doc) {
        console.log(doc._id);
        return Promise.resolve();
    }
}
