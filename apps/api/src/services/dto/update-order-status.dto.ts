import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['in_progress', 'delivered', 'completed', 'cancelled', 'revision_requested'])
  status!: string;
}
