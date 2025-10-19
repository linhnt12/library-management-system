export interface FileValidationOptions {
  allowedExtensions?: string[];
  maxSizeInBytes?: number;
  minSizeInBytes?: number;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface FileInfo {
  name: string;
  size: number;
  extension: string;
  path: string;
}
