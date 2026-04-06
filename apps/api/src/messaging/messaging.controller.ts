import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.messagingService.listConversations(user.id);
  }

  @Get(':id/messages')
  getMessages(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagingService.getMessages(user.id, conversationId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(':id/messages')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  sendMessage(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user.id, conversationId, dto);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: any, @Param('id') conversationId: string) {
    return this.messagingService.markAsRead(user.id, conversationId);
  }
}
