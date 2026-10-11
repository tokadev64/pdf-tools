/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module "tesseract.js/dist/tesseract.esm.min.js" {
  interface OcrWorker {
    setParameters(params: Record<string, string>): Promise<unknown>;
    recognize(image: HTMLCanvasElement): Promise<{ data: { text: string } }>;
    terminate(): Promise<unknown>;
  }

  const Tesseract: {
    createWorker(
      langs?: string,
      oem?: number,
      options?: {
        logger?: (message: { status: string; progress: number }) => void;
        errorHandler?: (error: unknown) => void;
      },
    ): Promise<OcrWorker>;
  };

  export default Tesseract;
}
