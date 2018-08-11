import { TablesImporter } from "./tables-import/tables-importer";

const imported = new TablesImporter();
imported.import().subscribe(() => {});