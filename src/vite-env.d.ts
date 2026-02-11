/// <reference types="vite/client" />

declare module "*?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "*?worker&url" {
  const url: string;
  export default url;
}

declare module "*/worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "@/features/chat/api/webllm/worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}
