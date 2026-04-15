import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [totalMembers, totalContributions, totalExpenses, activeEvents] = await Promise.all([
      this.prisma.member.count({ where: { approvalStatus: 'APPROVED' } }),
      this.prisma.contribution.aggregate({ _sum: { amount: true } }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.contributionEvent.count({ where: { status: 'ACTIVE' } }),
    ]);

    const income = totalContributions._sum.amount ?? 0;
    const expenses = totalExpenses._sum.amount ?? 0;

    return {
      totalMembers,
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      activeEvents,
    };
  }

  async getMonthlyTrends() {
    const yearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    const [contributions, expenses] = await Promise.all([
      this.prisma.contribution.findMany({
        where: { date: { gte: yearAgo } },
        select: { amount: true, date: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.expense.findMany({
        where: { date: { gte: yearAgo } },
        select: { amount: true, date: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const monthMap: Record<string, { month: string; income: number; expenses: number }> = {};
    const toMonthKey = (d: Date) =>
      d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short' });

    for (const c of contributions) {
      const key = toMonthKey(new Date(c.date));
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0 };
      monthMap[key].income += c.amount;
    }

    for (const e of expenses) {
      const key = toMonthKey(new Date(e.date));
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0 };
      monthMap[key].expenses += e.amount;
    }

    return Object.values(monthMap);
  }

  async getTopContributors() {
    const results = await this.prisma.contribution.groupBy({
      by: ['memberId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    const memberIds = results.map((r) => r.memberId);
    const members = await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, jumuia: true },
    });

    const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

    return results.map((r) => ({
      member: memberMap[r.memberId],
      totalContributed: r._sum.amount ?? 0,
    }));
  }

  async getOutstanding() {
    const payments = await this.prisma.eventPayment.findMany({
      where: { status: 'PENDING', event: { status: 'ACTIVE' } },
      include: {
        member: { select: { id: true, name: true, phone: true, jumuia: true } },
        event: { select: { id: true, title: true, dueDate: true } },
      },
      orderBy: { member: { name: 'asc' } },
    });

    const memberMap: Record<string, { member: any; totalOwed: number; events: any[] }> = {};
    for (const p of payments) {
      const mid = p.member.id;
      if (!memberMap[mid]) memberMap[mid] = { member: p.member, totalOwed: 0, events: [] };
      memberMap[mid].totalOwed += p.amountDue - p.amountPaid;
      memberMap[mid].events.push({ event: p.event, amountOwed: p.amountDue - p.amountPaid });
    }

    return Object.values(memberMap).sort((a, b) => b.totalOwed - a.totalOwed);
  }
}
