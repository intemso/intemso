import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('contracts/:contractId/reviews')
  create(
    @CurrentUser() user: any,
    @Param('contractId') contractId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, contractId, dto);
  }

  @Get('users/:userId/reviews')
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByUser(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('contracts/:contractId/reviews')
  findByContract(@Param('contractId') contractId: string) {
    return this.reviewsService.findByContract(contractId);
  }

  @Post('reviews/:id/flag')
  flag(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewsService.flag(user.id, id);
  }
}
