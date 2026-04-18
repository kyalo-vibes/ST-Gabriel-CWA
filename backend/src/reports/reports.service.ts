import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [totalMembers, activeMembers, totalContributions, totalExpenses, activeEvents, pendingPayments] =
      await Promise.all([
        this.prisma.member.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.member.count({ where: { approvalStatus: 'APPROVED', status: 'ACTIVE' } }),
        this.prisma.contribution.aggregate({ _sum: { amount: true } }),
        this.prisma.expense.aggregate({ _sum: { amount: true } }),
        this.prisma.contributionEvent.count({ where: { status: 'ACTIVE' } }),
        this.prisma.eventPayment.findMany({
          where: { status: 'PENDING', event: { status: 'ACTIVE' } },
          select: { memberId: true, amountDue: true, amountPaid: true },
        }),
      ]);

    const income = totalContributions._sum.amount ?? 0;
    const expenses = totalExpenses._sum.amount ?? 0;
    const totalOutstanding = pendingPayments.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);
    const membersWithDebt = new Set(pendingPayments.map((p) => p.memberId)).size;

    return {
      totalMembers,
      activeMembers,
      totalContributions: income,
      totalExpenses: expenses,
      totalOutstanding,
      membersWithDebt,
      activeEvents,
    };
  }

  async getMonthlyTrends() {
    const [contributions, expenses, members] = await Promise.all([
      this.prisma.contribution.findMany({
        select: { amount: true, date: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.expense.findMany({
        select: { amount: true, date: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.member.findMany({
        where: { approvalStatus: 'APPROVED' },
        select: { joinDate: true },
        orderBy: { joinDate: 'asc' },
      }),
    ]);

    const toMonthKey = (d: Date) =>
      d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    const monthMap: Record<string, { month: string; income: number; expenses: number; members: number }> = {};

    for (const c of contributions) {
      const key = toMonthKey(new Date(c.date));
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0, members: 0 };
      monthMap[key].income += c.amount;
    }

    for (const e of expenses) {
      const key = toMonthKey(new Date(e.date));
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0, members: 0 };
      monthMap[key].expenses += e.amount;
    }

    // Running cumulative member count per month
    const membersByMonth: Record<string, number> = {};
    for (const m of members) {
      const key = toMonthKey(new Date(m.joinDate));
      membersByMonth[key] = (membersByMonth[key] ?? 0) + 1;
    }

    // Sort all months chronologically, then compute running member total
    const allKeys = [...new Set([...Object.keys(monthMap), ...Object.keys(membersByMonth)])].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    let runningMembers = 0;
    return allKeys.map((key) => {
      runningMembers += membersByMonth[key] ?? 0;
      const entry = monthMap[key] ?? { month: key, income: 0, expenses: 0, members: 0 };
      return { ...entry, month: key, members: runningMembers };
    });
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
