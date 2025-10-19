import { FileInfo, FileOperationResult, FileValidationOptions } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * FileUtils class provides utility methods for file system operations
 * including writing, deleting, size checking, and extension validation
 */
export class FileUtils {
  private static readonly DEFAULT_UPLOAD_DIR = 'uploads';
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly DEFAULT_ALLOWED_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
  ];

  /**
   * Write a file to the file system
   * @param fileBuffer - The file buffer to write
   * @param fileName - The name of the file
   * @param options - Optional configuration for file writing
   * @returns Promise<FileOperationResult>
   */
  static async writeFileToSystem(
    fileBuffer: Buffer,
    fileName: string,
    options?: {
      directory?: string;
      overwrite?: boolean;
      createDirectory?: boolean;
    }
  ): Promise<FileOperationResult> {
    try {
      const {
        directory = this.DEFAULT_UPLOAD_DIR,
        overwrite = false,
        createDirectory = true,
      } = options || {};

      // Sanitize filename to prevent directory traversal
      const sanitizedFileName = path.basename(fileName);
      const fullPath = path.join(process.cwd(), directory, sanitizedFileName);

      // Create directory if it doesn't exist and createDirectory is true
      if (createDirectory) {
        const dirPath = path.dirname(fullPath);
        try {
          await fs.access(dirPath);
        } catch {
          await fs.mkdir(dirPath, { recursive: true });
        }
      }

      // Check if file exists and handle overwrite logic
      if (!overwrite) {
        try {
          await fs.access(fullPath);
          return {
            success: false,
            message: `File ${sanitizedFileName} already exists. Use overwrite option to replace it.`,
          };
        } catch {
          // File doesn't exist, proceed with writing
        }
      }

      // Write the file
      await fs.writeFile(fullPath, fileBuffer);

      return {
        success: true,
        message: `File ${sanitizedFileName} written successfully`,
        data: {
          fileName: sanitizedFileName,
          path: fullPath,
          size: fileBuffer.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a file from the file system
   * @param filePath - The path to the file to delete
   * @param options - Optional configuration for file deletion
   * @returns Promise<FileOperationResult>
   */
  static async deleteFileFromSystem(
    filePath: string,
    options?: {
      force?: boolean;
      checkExists?: boolean;
    }
  ): Promise<FileOperationResult> {
    try {
      const { force = false, checkExists = true } = options || {};

      // Resolve the full path
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

      // Check if file exists
      if (checkExists) {
        try {
          await fs.access(fullPath);
        } catch {
          return {
            success: false,
            message: `File does not exist: ${filePath}`,
          };
        }
      }

      // Get file stats before deletion for logging
      let fileInfo: FileInfo | undefined;
      try {
        const stats = await fs.stat(fullPath);
        fileInfo = {
          name: path.basename(fullPath),
          size: stats.size,
          extension: path.extname(fullPath),
          path: fullPath,
        };
      } catch {
        // If we can't get stats, continue with deletion
      }

      // Delete the file
      await fs.unlink(fullPath);

      return {
        success: true,
        message: `File deleted successfully: ${path.basename(filePath)}`,
        data: fileInfo,
      };
    } catch (error) {
      if (!options?.force) {
        return {
          success: false,
          message: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

      // If force is true, consider it successful even if deletion failed
      return {
        success: true,
        message: `File deletion attempted (force mode): ${path.basename(filePath)}`,
      };
    }
  }

  /**
   * Check the size of a file
   * @param filePath - The path to the file or a Buffer/File object
   * @param options - Optional validation options
   * @returns Promise<FileOperationResult>
   */
  static async checkFileSize(
    filePath: string | Buffer | File,
    options?: {
      maxSizeInBytes?: number;
      minSizeInBytes?: number;
      returnSizeInMB?: boolean;
    }
  ): Promise<FileOperationResult> {
    try {
      const {
        maxSizeInBytes = this.DEFAULT_MAX_SIZE,
        minSizeInBytes = 0,
        returnSizeInMB = false,
      } = options || {};

      let fileSize: number;
      let fileName: string;

      if (typeof filePath === 'string') {
        // File path provided
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

        const stats = await fs.stat(fullPath);
        fileSize = stats.size;
        fileName = path.basename(fullPath);
      } else if (Buffer.isBuffer(filePath)) {
        // Buffer provided
        fileSize = filePath.length;
        fileName = 'buffer';
      } else if (filePath instanceof File) {
        // File object provided (browser environment)
        fileSize = filePath.size;
        fileName = filePath.name;
      } else {
        return {
          success: false,
          message: 'Invalid file input. Expected file path, Buffer, or File object.',
        };
      }

      // Validate size constraints
      const sizeInMB = fileSize / (1024 * 1024);
      const maxSizeInMB = maxSizeInBytes / (1024 * 1024);
      const minSizeInMB = minSizeInBytes / (1024 * 1024);

      if (fileSize > maxSizeInBytes) {
        return {
          success: false,
          message: `File ${fileName} is too large. Size: ${sizeInMB.toFixed(2)}MB, Max allowed: ${maxSizeInMB.toFixed(2)}MB`,
        };
      }

      if (fileSize < minSizeInBytes) {
        return {
          success: false,
          message: `File ${fileName} is too small. Size: ${sizeInMB.toFixed(2)}MB, Min required: ${minSizeInMB.toFixed(2)}MB`,
        };
      }

      return {
        success: true,
        message: `File size is valid: ${returnSizeInMB ? `${sizeInMB.toFixed(2)}MB` : `${fileSize} bytes`}`,
        data: {
          fileName,
          sizeInBytes: fileSize,
          sizeInMB: sizeInMB,
          isValid: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to check file size: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate file extension
   * @param fileName - The name of the file or file path
   * @param options - Validation options
   * @returns FileOperationResult
   */
  static validateFileExt(
    fileName: string | File,
    options?: FileValidationOptions
  ): FileOperationResult {
    try {
      const { allowedExtensions = this.DEFAULT_ALLOWED_EXTENSIONS } = options || {};

      let fileNameStr: string;
      if (typeof fileName === 'string') {
        fileNameStr = fileName;
      } else if (fileName instanceof File) {
        fileNameStr = fileName.name;
      } else {
        return {
          success: false,
          message: 'Invalid input. Expected file name string or File object.',
        };
      }

      // Extract extension
      const extension = path.extname(fileNameStr).toLowerCase();

      if (!extension) {
        return {
          success: false,
          message: `File ${path.basename(fileNameStr)} has no extension`,
        };
      }

      // Normalize allowed extensions to lowercase
      const normalizedAllowedExts = allowedExtensions.map(ext =>
        ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
      );

      if (!normalizedAllowedExts.includes(extension)) {
        return {
          success: false,
          message: `File extension ${extension} is not allowed. Allowed extensions: ${normalizedAllowedExts.join(', ')}`,
        };
      }

      return {
        success: true,
        message: `File extension ${extension} is valid`,
        data: {
          fileName: path.basename(fileNameStr),
          extension,
          isValid: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate file extension: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Comprehensive file validation combining size and extension checks
   * @param file - File path, Buffer, or File object
   * @param fileName - File name (required if file is Buffer)
   * @param options - Validation options
   * @returns Promise<FileOperationResult>
   */
  static async validateFile(
    file: string | Buffer | File,
    fileName?: string,
    options?: FileValidationOptions
  ): Promise<FileOperationResult> {
    try {
      // Validate extension
      let fileNameForValidation: string | File;
      if (typeof file === 'string') {
        fileNameForValidation = file;
      } else if (file instanceof File) {
        fileNameForValidation = file;
      } else if (Buffer.isBuffer(file) && fileName) {
        fileNameForValidation = fileName;
      } else {
        return {
          success: false,
          message: 'File name is required when validating Buffer',
        };
      }

      const extValidation = this.validateFileExt(fileNameForValidation, options);
      if (!extValidation.success) {
        return extValidation;
      }

      // Validate size
      const sizeValidation = await this.checkFileSize(file, {
        maxSizeInBytes: options?.maxSizeInBytes,
        minSizeInBytes: options?.minSizeInBytes,
      });
      if (!sizeValidation.success) {
        return sizeValidation;
      }

      return {
        success: true,
        message: 'File validation passed',
        data: {
          extensionValidation: extValidation.data,
          sizeValidation: sizeValidation.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get file information
   * @param filePath - Path to the file
   * @returns Promise<FileOperationResult>
   */
  static async getFileInfo(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

      const stats = await fs.stat(fullPath);

      const fileInfo: FileInfo = {
        name: path.basename(fullPath),
        size: stats.size,
        extension: path.extname(fullPath),
        path: fullPath,
      };

      return {
        success: true,
        message: 'File information retrieved successfully',
        data: {
          ...fileInfo,
          sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export utility functions for direct use
export const {
  writeFileToSystem,
  deleteFileFromSystem,
  checkFileSize,
  validateFileExt,
  validateFile,
  getFileInfo,
} = FileUtils;
