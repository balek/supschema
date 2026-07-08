declare module 'protobufjs-cli/targets/proto' {
  import { Root } from 'protobufjs';

  const proto: (
    root: Root,
    options: { syntax: 'proto2' | 'proto3' },
    callback: (error: Error | null, result: string) => void,
  ) => void;
  export default proto;
}
