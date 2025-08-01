export interface IUploadResponse {
  message: string;
  data: {
    path: string;
    id: string;
    fullPath: string;
  };
  publicUrl: string;
}
