import { DBSchema } from "idb";

export interface ExtensionDB extends DBSchema {
  promptsV1: {
    key: number;
    value: {
      key?: number;
      title: string;
      text: string;
      ctime: number;
      mtime: number;
      usage: number;
      nextKey?: number;
    };
    indexes: {
      byUsage: string;
      byNextKey: number;
    };
  };
}

export type PromptsV1Item = ExtensionDB["promptsV1"]["value"];

type AssertPartialType<FullType, PartialType extends Partial<FullType>> = PartialType;

export type AddPromptV1Payload = AssertPartialType<
  PromptsV1Item,
  {
    title: string;
    text: string;
  }
>;

export type UpdatePromptV1Payload = AssertPartialType<
  PromptsV1Item,
  {
    title: string;
    text: string;
    usage?: number;
  }
>;
