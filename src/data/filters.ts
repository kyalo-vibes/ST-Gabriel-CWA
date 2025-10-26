export const savedFiltersData = [
  {
    id: "f-001",
    name: "Active Defaulters",
    criteria: {
      status: ["Active"],
      minBalance: 1000,
    },
    createdAt: "2024-10-20"
  },
  {
    id: "f-002",
    name: "Welfare Contributors",
    criteria: {
      contributionType: ["Welfare"],
      status: ["Active"]
    },
    createdAt: "2024-10-15"
  }
];
