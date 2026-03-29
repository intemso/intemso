import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { SearchStudentsDto } from './dto/search-students.dto';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  search(@Query() dto: SearchStudentsDto) {
    return this.studentsService.search(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.studentsService.findById(id);
    if (!profile) throw new NotFoundException('Student not found');
    return profile;
  }
}
