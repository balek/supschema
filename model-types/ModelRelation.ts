import { createType, defineConstructor, Schema, SchemaOptions } from '@supschema/core';
import Model from './Model.js';

export type ReferentialAction = 'Cascade' | 'Restrict' | 'NoAction' | 'SetNull' | 'SetDefault';

export interface ModelRelation<
  Model1 extends Model = Model,
  Name1 extends string = string,
  // Mod1 extends RelationModificator = RelationModificator,
  Model2 extends Model = Model,
  Name2 extends string = string,
  // Mod2 extends RelationModificator = RelationModificator,
> extends Schema {
  model: Model1;
  name: Name1;
  fields: string[];
  // fromType: Mod1;
  otherModel: Model2;
  otherName: Name2;
  otherFields: string[];
  // toType: Mod2;
  onDelete?: ReferentialAction;
  onUpdate?: ReferentialAction;
  map?: string;
  rev: ModelRelation<Model2, Name2, Model1, Name1>;
}

export const ModelRelation = createType(
  import.meta,
  Schema,
  defineConstructor(
    <
      Model1 extends Model,
      Name1 extends string,
      // Mod1 extends RelationModificator,
      Model2 extends Model,
      Name2 extends string,
      // Mod2 extends RelationModificator,
    >(
      model: Model1,
      name: Name1,
      fields: (keyof Model1['properties'] & string)[],
      // fromType: Mod1,
      otherModel: Model2,
      otherName: Name2,
      otherFields: (keyof Model2['properties'] & string)[],
      // toType: Mod2,
      opts?: Omit<
        SchemaOptions<ModelRelation<Model1, Name1, Model2, Name2>>,
        'model' | 'name' | 'fields' | 'otherModel' | 'otherName' | 'otherFields'
      >,
    ): SchemaOptions<ModelRelation<Model1, Name1, Model2, Name2>> => ({
      model: model,
      name: name,
      fields: fields,
      // fromType,
      otherModel: otherModel,
      otherName: otherName,
      otherFields: otherFields,
      // toType,
      get rev() {
        return ModelRelation(otherModel, otherName, otherFields, model, name, fields);
      },
      ...opts,
    }),
  ),
  ({ model, name, fields, otherModel, otherName, otherFields, ...opts }) =>
    [model, name, fields, otherModel, otherName, otherFields, opts] as const,
);
export default ModelRelation;
