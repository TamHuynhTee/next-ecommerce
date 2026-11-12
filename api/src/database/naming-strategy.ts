import { DefaultNamingStrategy, Table } from 'typeorm';

export class AppNamingStrategy extends DefaultNamingStrategy {
  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = (
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name
    ).replace(/\./g, '_');

    return `pk_${tableName}_${[...columnNames].sort().join('_')}`;
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    // _referencedTablePath?: string,
    // _referencedColumnNames?: string[],
  ): string {
    const tableName = (
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name
    ).replace(/\./g, '_');

    return `fk_${tableName}_${[...columnNames].sort().join('_')}`;
  }
}
