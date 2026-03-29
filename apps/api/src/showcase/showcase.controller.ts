import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ShowcaseService } from './showcase.service';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
} from './dto/portfolio.dto';

@Controller('showcase')
export class ShowcaseController {
  constructor(private showcaseService: ShowcaseService) {}

  /** Browse published portfolio items (public) */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('skills') skills?: string,
    @Query('studentId') studentId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.showcaseService.findAll({
      search,
      categoryId,
      skills,
      studentId,
      sortBy,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** Featured portfolio items */
  @Get('featured')
  findFeatured(@Query('limit') limit?: string) {
    return this.showcaseService.findFeatured(
      limit ? parseInt(limit) : undefined,
    );
  }

  /** My portfolio items (student — all statuses) */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can manage portfolios');
    return this.showcaseService.findMine(user.studentProfile.id);
  }

  /** Single portfolio item detail */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showcaseService.findById(id);
  }

  /** Create portfolio item */
  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() dto: CreatePortfolioItemDto, @CurrentUser() user: any) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can create portfolio items');
    return this.showcaseService.create(user.studentProfile.id, dto);
  }

  /** Update portfolio item */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioItemDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can manage portfolio items');
    return this.showcaseService.update(id, user.studentProfile.id, dto);
  }

  /** Delete portfolio item */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can manage portfolio items');
    return this.showcaseService.remove(id, user.studentProfile.id);
  }

  /** Like a portfolio item */
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  like(@Param('id') id: string) {
    return this.showcaseService.toggleLike(id);
  }
}
