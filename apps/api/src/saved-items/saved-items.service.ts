import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedItemsService {
  constructor(private prisma: PrismaService) {}

  // ── Saved Gigs ──

  async saveGig(studentId: string, gigId: string) {
    // Verify gig exists
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');

    try {
      const saved = await this.prisma.savedGig.create({
        data: { studentId, gigId },
      });
      return { id: saved.id, saved: true };
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Gig already saved');
      throw e;
    }
  }

  async unsaveGig(studentId: string, gigId: string) {
    await this.prisma.savedGig.deleteMany({
      where: { studentId, gigId },
    });
    return { saved: false };
  }

  async getSavedGigs(studentId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.savedGig.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          gig: {
            select: {
              id: true,
              title: true,
              budgetType: true,
              budgetMin: true,
              budgetMax: true,
              locationType: true,
              status: true,
              experienceLevel: true,
              createdAt: true,
              category: { select: { name: true, slug: true } },
              employer: {
                select: {
                  id: true,
                  businessName: true,
                  ratingAvg: true,
                },
              },
              _count: { select: { proposals: true } },
            },
          },
        },
      }),
      this.prisma.savedGig.count({ where: { studentId } }),
    ]);

    return {
      data: data.map((sg) => ({ ...sg.gig, savedAt: sg.createdAt })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async isGigSaved(studentId: string, gigId: string): Promise<boolean> {
    const saved = await this.prisma.savedGig.findUnique({
      where: { studentId_gigId: { studentId, gigId } },
    });
    return !!saved;
  }

  // ── Saved Talent ──

  async saveTalent(employerId: string, studentId: string) {
    // Verify student exists
    const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    try {
      const saved = await this.prisma.savedTalent.create({
        data: { employerId, studentId },
      });
      return { id: saved.id, saved: true };
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Talent already saved');
      throw e;
    }
  }

  async unsaveTalent(employerId: string, studentId: string) {
    await this.prisma.savedTalent.deleteMany({
      where: { employerId, studentId },
    });
    return { saved: false };
  }

  async getSavedTalent(employerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.savedTalent.findMany({
        where: { employerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              professionalTitle: true,
              university: true,
              skills: true,
              hourlyRate: true,
              ratingAvg: true,
              ratingCount: true,
              isVerified: true,
              talentBadge: true,
              gigsCompleted: true,
              jobSuccessScore: true,
            },
          },
        },
      }),
      this.prisma.savedTalent.count({ where: { employerId } }),
    ]);

    return {
      data: data.map((st) => ({
        ...st.student,
        savedAt: st.createdAt,
        notes: st.notes,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async isTalentSaved(employerId: string, studentId: string): Promise<boolean> {
    const saved = await this.prisma.savedTalent.findUnique({
      where: { employerId_studentId: { employerId, studentId } },
    });
    return !!saved;
  }
}
