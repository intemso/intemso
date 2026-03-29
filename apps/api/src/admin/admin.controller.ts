import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { PaymentsService } from '../payments/payments.service';
import {
  ListUsersDto,
  UpdateUserDto,
  ResolveDisputeDto,
  ReviewReportDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ── Users ──

  @Get('users')
  listUsers(@Query() dto: ListUsersDto) {
    return this.adminService.listUsers(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, user.id, dto);
  }

  // ── Disputes ──

  @Get('disputes')
  listDisputes(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listDisputes({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.adminService.resolveDispute(id, user.id, dto);
  }

  // ── Reports ──

  @Get('reports')
  listReports(
    @Query('status') status?: string,
    @Query('entity') entity?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listReports({
      status,
      entity,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('reports/:id')
  reviewReport(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: ReviewReportDto) {
    return this.adminService.reviewReport(id, user.id, dto);
  }

  // ── Community Moderation ──

  @Post('community/posts/:id/hide')
  hidePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.hideCommunityPost(id, user.id);
  }

  @Delete('community/posts/:id')
  deletePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteCommunityPost(id, user.id);
  }

  @Delete('community/comments/:id')
  deleteComment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteCommunityComment(id, user.id);
  }

  // ── Stats ──

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ── Categories ──

  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  createCategory(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(user.id, dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, user.id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteCategory(id, user.id);
  }

  // ── Financial Dashboard ──

  @Get('financial/overview')
  getFinancialOverview() {
    return this.paymentsService.getFinancialOverview();
  }

  @Get('financial/reconciliation')
  getReconciliationHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.getReconciliationHistory(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('financial/reconciliation/trigger')
  triggerReconciliation() {
    return this.paymentsService.triggerManualReconciliation();
  }
}
