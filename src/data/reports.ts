export const reportsData = {
  summary: {
    totalMembers: 50,
    activeMembers: 45,
    inactiveMembers: 5,
    totalContributions: 742500,
    totalExpenses: 185000,
    outstandingBalance: 56500
  },
  monthlyTrends: [
    { month: "Jan 2024", contributions: 12500, expenses: 8000, members: 5 },
    { month: "Feb 2024", contributions: 18000, expenses: 12000, members: 10 },
    { month: "Mar 2024", contributions: 24500, expenses: 15000, members: 15 },
    { month: "Apr 2024", contributions: 32000, expenses: 18000, members: 22 },
    { month: "May 2024", contributions: 41500, expenses: 22000, members: 28 },
    { month: "Jun 2024", contributions: 48000, expenses: 25000, members: 33 },
    { month: "Jul 2024", contributions: 52500, expenses: 28000, members: 38 },
    { month: "Aug 2024", contributions: 58000, expenses: 30000, members: 42 },
    { month: "Sep 2024", contributions: 63500, expenses: 32000, members: 45 },
    { month: "Oct 2024", contributions: 68000, expenses: 35000, members: 50 }
  ],
  contributionTypes: [
    { type: "Monthly Contribution", amount: 685000, percentage: 92.3 },
    { type: "Special Contribution", amount: 42500, percentage: 5.7 },
    { type: "Fundraising", amount: 15000, percentage: 2.0 }
  ],
  topContributors: [
    { member_id: "m-029", name: "Pauline Wanjala", total: 25000 },
    { member_id: "m-050", name: "Diana Wanjiru", total: 23000 },
    { member_id: "m-043", name: "Tabitha Jemutai", total: 22500 },
    { member_id: "m-021", name: "Beatrice Onyango", total: 22000 },
    { member_id: "m-034", name: "Mercy Achieng", total: 21500 }
  ],
  outstandingBalances: [
    { member_id: "m-028", name: "Monica Apiyo", balance: 4000 },
    { member_id: "m-037", name: "Miriam Waithera", balance: 3500 },
    { member_id: "m-012", name: "Margaret Wairimu", balance: 3500 },
    { member_id: "m-042", name: "Susan Kariuki", balance: 3000 },
    { member_id: "m-020", name: "Agnes Nyokabi", balance: 3000 }
  ]
};
