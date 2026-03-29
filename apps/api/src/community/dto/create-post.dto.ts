import { IsString, IsOptional, IsEnum, IsArray, MaxLength, MinLength, ArrayMaxSize } from 'class-validator';

export enum PostType {
  DISCUSSION = 'discussion',
  QUESTION = 'question',
  TIP = 'tip',
  ACHIEVEMENT = 'achievement',
  EVENT = 'event',
}

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}
