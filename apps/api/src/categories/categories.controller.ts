import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** GET /categories — list all categories (active by default) */
  @Get()
  @CacheTTL(300_000) // 5 minutes
  findAll(@Query('active') active?: string) {
    const isActive = active === 'false' ? false : active === 'all' ? undefined : true;
    return this.categoriesService.findAll({ active: isActive });
  }

  /** GET /categories/:slug — get one category by slug */
  @Get(':slug')
  @CacheTTL(300_000)
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
