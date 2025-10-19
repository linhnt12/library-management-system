import { FileUtils } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/files/upload - Upload files to the server
 *
 * Request body: FormData with file(s)
 * Query parameters:
 * - directory: string - target directory (default: 'uploads')
 * - overwrite: boolean - allow overwriting existing files
 * - maxSize: number - maximum file size in bytes
 * - allowedExtensions: string[] - comma-separated allowed extensions
 *
 * Examples:
 * - POST /api/files/upload (with FormData containing files)
 * - POST /api/files/upload?directory=images&overwrite=true
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const directory = searchParams.get('directory') || 'uploads';
    const overwrite = searchParams.get('overwrite') === 'true';
    const maxSize = searchParams.get('maxSize')
      ? parseInt(searchParams.get('maxSize')!)
      : undefined;
    const allowedExtensionsParam = searchParams.get('allowedExtensions');
    const allowedExtensions = allowedExtensionsParam
      ? allowedExtensionsParam.split(',')
      : undefined;

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validationResult = await FileUtils.validateFile(file, file.name, {
          maxSizeInBytes: maxSize,
          allowedExtensions,
        });

        if (!validationResult.success) {
          errors.push({
            fileName: file.name,
            error: validationResult.message,
          });
          continue;
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write file to system
        const writeResult = await FileUtils.writeFileToSystem(buffer, file.name, {
          directory,
          overwrite,
          createDirectory: true,
        });

        if (writeResult.success) {
          results.push({
            fileName: file.name,
            ...writeResult.data,
            message: writeResult.message,
          });
        } else {
          errors.push({
            fileName: file.name,
            error: writeResult.message,
          });
        }
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    // Return results
    const response = {
      success: results.length > 0,
      uploaded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };

    const statusCode = results.length > 0 ? (errors.length > 0 ? 207 : 200) : 400;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/files/upload - Get upload configuration and limits
 */
export async function GET() {
  try {
    const config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.pdf',
        '.doc',
        '.docx',
        '.txt',
        '.csv',
        '.xlsx',
      ],
      defaultDirectory: 'uploads',
      supportedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting upload config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
