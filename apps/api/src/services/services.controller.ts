import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { CreateOrderDto } from './dto/order.dto';

@Controller('services')
export class ServicesController {
  constructor(
    private servicesService: ServicesService,
    private prisma: PrismaService,
  ) {}

  /** Browse active services (public) */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tags') tags?: string,
    @Query('maxDeliveryDays') maxDeliveryDays?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicesService.findAll({
      search,
      categoryId,
      tags,
      maxDeliveryDays: maxDeliveryDays ? parseInt(maxDeliveryDays) : undefined,
      sortBy,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** My service listings (student) */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: any) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can manage services');
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new BadRequestException('Student profile not found');
    return this.servicesService.findMyListings(profile.id);
  }

  /** Service detail */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  /** Create service listing */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateServiceDto, @CurrentUser() user: any) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can create services');
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new BadRequestException('Student profile not found');
    return this.servicesService.create(profile.id, dto);
  }

  /** Update service listing */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'student')
      throw new ForbiddenException('Only students can manage services');
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new BadRequestException('Student profile not found');
    return this.servicesService.update(id, profile.id, dto);
  }

  /** Order a service (employer) */
  @Post(':id/order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Param('id') id: string,
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'employer')
      throw new ForbiddenException('Only employers can order services');
    const profile = await this.prisma.employerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new BadRequestException('Employer profile not found');
    return this.servicesService.createOrder(id, profile.id, dto);
  }

  /** List my orders */
  @Get('orders/mine')
  @UseGuards(JwtAuthGuard)
  listMyOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicesService.listMyOrders(
      user.id,
      user.role,
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  /** Get order detail */
  @Get('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('orderId') orderId: string, @CurrentUser() user: any) {
    return this.servicesService.getOrder(orderId, user.id);
  }

  /** Update order status */
  @Patch('orders/:orderId/status')
  @UseGuards(JwtAuthGuard)
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.servicesService.updateOrderStatus(orderId, user.id, status);
  }
}
