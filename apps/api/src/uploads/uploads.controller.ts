import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService, UploadedFile as UploadedFileResult } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadedFileResult> {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadsService.uploadAvatar(file);
  }

  @Post('portfolio')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadedFileResult[]> {
    if (!files?.length) throw new BadRequestException('No files provided');
    return Promise.all(files.map((f) => this.uploadsService.uploadPortfolio(f)));
  }

  @Post('deliverable')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadDeliverable(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadedFileResult[]> {
    if (!files?.length) throw new BadRequestException('No files provided');
    return Promise.all(files.map((f) => this.uploadsService.uploadDeliverable(f)));
  }

  @Post('attachment')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadedFileResult> {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadsService.uploadAttachment(file);
  }
}
