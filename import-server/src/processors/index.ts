import * as commandLineArgs from 'command-line-args';
import { MapperInterface } from './mapper';
import { Processor } from './processor';

let p = commandLineArgs([{ name: 'mapper', type: String }])

console.log('=== Process with', p.mapper);

let Mapper: any = require('./' + p.mapper);
if (Mapper.default) Mapper = Mapper.default;

let mapper: MapperInterface = new Mapper();

let processor = new Processor(mapper);

processor.run().then(() => {
    console.log('=== Done');
});
