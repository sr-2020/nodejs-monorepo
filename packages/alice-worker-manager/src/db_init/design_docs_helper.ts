import * as glob from 'glob';
import * as Path from 'path';

export function getAllDesignDocs(): any[] {
  const designDocPath = Path.join(process.cwd(), 'src', 'db_init', 'design_docs');
  return glob.sync(Path.join(designDocPath, '*.js'))
    .map((f) => Path.basename(f, Path.extname(f)))
    .map((docName) => {
       const designDocObject = require(Path.join(designDocPath, docName));
       designDocObject._id = `_design/${docName}`;
       return designDocObject;
    });
}
