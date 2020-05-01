"use strict";
/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function nameIsReservedKeyword(name) {
    var reservedKeywords = [
        'string',
        'number',
        'package',
        'public',
    ];
    return reservedKeywords.indexOf(name) !== -1;
}
function normalizeName(name, options) {
    if (nameIsReservedKeyword(name)) {
        return name + '_';
    }
    else {
        return name;
    }
}
exports.normalizeName = normalizeName;
function generateTableInterface(tableNameRaw, tableDefinition, options) {
    var tableName = options.transformTypeName(tableNameRaw);
    var selectableMembers = '', insertableMembers = '';
    Object.keys(tableDefinition).forEach(function (columnNameRaw) {
        var columnName = options.transformColumnName(columnNameRaw), columnDef = tableDefinition[columnNameRaw], possiblyOrNull = columnDef.nullable ? ' | null' : '', insertablyOptional = columnDef.nullable || columnDef.hasDefault ? '?' : '', dateAsString = columnDef.tsType === 'Date' ? ' | DateString' : '', possiblyOrDefault = columnDef.nullable || columnDef.hasDefault ? ' | DefaultType' : '';
        selectableMembers += columnName + ": " + columnDef.tsType + possiblyOrNull + ";\n";
        insertableMembers += "" + columnName + insertablyOptional + ": " + columnDef.tsType + dateAsString + possiblyOrNull + possiblyOrDefault + " | SQLFragment;\n";
    });
    var normalizedTableName = normalizeName(tableName, options);
    return "\n        export namespace " + normalizedTableName + " {\n          export type Table = \"" + tableName + "\";\n          export interface Selectable {\n            " + selectableMembers + " }\n          export type JSONSelectable = { [K in keyof Selectable]:\n            Date extends Selectable[K] ? Exclude<Selectable[K], Date> | DateString : Selectable[K] };\n          export interface Insertable {\n            " + insertableMembers + " }\n          export interface Updatable extends Partial<Insertable> { };\n          export type Whereable = { [K in keyof Insertable]?: Exclude<Insertable[K] | ParentColumn, null | DefaultType> };\n          export interface UpsertReturnable extends JSONSelectable, UpsertAction { };\n          export type Column = keyof Selectable;\n          export type OnlyCols<T extends readonly Column[]> = Pick<Selectable, T[number]>;\n          export type JSONOnlyCols<T extends readonly Column[]> = Pick<JSONSelectable, T[number]>;\n          export type SQLExpression = GenericSQLExpression | Table | Whereable | Column | ColumnNames<Updatable | (keyof Updatable)[]> | ColumnValues<Updatable>;\n          export type SQL = SQLExpression | SQLExpression[];\n          export interface OrderSpec {\n            by: SQL;\n            direction: 'ASC' | 'DESC';\n            nulls?: 'FIRST' | 'LAST';\n          }\n          export interface SelectOptions<C extends Column[], L extends SQLFragmentsMap, E extends SQLFragmentsMap> {\n              order?: OrderSpec[];\n              limit?: number;\n              offset?: number;\n              columns?: C;\n              extras?: E,\n              lateral?: L;\n              alias?: string;\n          }\n          type BaseSelectReturnType<C extends Column[]> = C extends undefined ? JSONSelectable : JSONOnlyCols<C>;\n          type EnhancedSelectReturnType<C extends Column[], L extends SQLFragmentsMap, E extends SQLFragmentsMap> =\n              L extends undefined ?\n              (E extends undefined ? BaseSelectReturnType<C> : BaseSelectReturnType<C> & PromisedSQLFragmentReturnTypeMap<E>) :\n              (E extends undefined ?\n                  BaseSelectReturnType<C> & PromisedSQLFragmentReturnTypeMap<L> :\n                  BaseSelectReturnType<C> & PromisedSQLFragmentReturnTypeMap<L> & PromisedSQLFragmentReturnTypeMap<E>);\n          export type FullSelectReturnType<C extends Column[], L extends SQLFragmentsMap, E extends SQLFragmentsMap, M extends SelectResultMode> =\n              M extends SelectResultMode.Many ? EnhancedSelectReturnType<C, L, E>[] :\n              M extends SelectResultMode.One ? EnhancedSelectReturnType<C, L, E> | undefined : number;\n        }\n  ";
}
exports.generateTableInterface = generateTableInterface;
function generateEnumType(enumObject, options) {
    var enumString = '';
    for (var enumNameRaw in enumObject) {
        var enumName = options.transformTypeName(enumNameRaw);
        enumString += "export type " + enumName + " = ";
        enumString += enumObject[enumNameRaw].map(function (v) { return "'" + v + "'"; }).join(' | ');
        enumString += ';\n';
        enumString += "export namespace every {\n";
        enumString += "  export type " + enumName + " = [";
        enumString += enumObject[enumNameRaw].map(function (v) { return "'" + v + "'"; }).join(', ') + '];\n';
        enumString += '}\n';
    }
    return enumString;
}
exports.generateEnumType = generateEnumType;
function generateTableTypes(tableNameRaw, tableDefinition, options) {
    var tableName = options.transformTypeName(tableNameRaw);
    var fields = '';
    Object.keys(tableDefinition).forEach(function (columnNameRaw) {
        var type = tableDefinition[columnNameRaw].tsType;
        var nullable = tableDefinition[columnNameRaw].nullable ? '| null' : '';
        var columnName = options.transformColumnName(columnNameRaw);
        fields += "export type " + normalizeName(columnName, options) + " = " + type + nullable + ";\n";
    });
    return "\n        export namespace " + tableName + "Fields {\n        " + fields + "\n        }\n    ";
}
exports.generateTableTypes = generateTableTypes;
//# sourceMappingURL=typescript.js.map