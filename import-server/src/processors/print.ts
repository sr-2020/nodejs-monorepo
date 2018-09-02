import { MapperInterface } from './mapper';

export default class Print implements MapperInterface {
  public filter() { return true; }
  public map(doc: any) {
    console.log(doc._id);
    return Promise.resolve();
  }
}
