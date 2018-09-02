import * as commandLineArgs from 'command-line-args';
import { MapperInterface } from './mapper';
import { Processor } from './processor';

const p = commandLineArgs([{ name: 'mapper', type: String }]);

console.log('=== Process with', p.mapper);

// tslint:disable-next-line:no-var-requires
let importedMapper: any = require('./' + p.mapper);
if (importedMapper.default) importedMapper = importedMapper.default;

const mapper: MapperInterface = new importedMapper();

const processor = new Processor(mapper);

processor.run().then((total: number) => {
  console.log('=== processed ' + total + ' models');
  console.log('=== Done');
});
