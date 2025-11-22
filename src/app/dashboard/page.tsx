'use client';

import {
  AlertCard,
  BarChart,
  LineChart,
  PieChart,
  StatCard,
  TimeRangeSelector,
  TopList,
} from '@/components';
import type { TimeRange } from '@/components/dashboard/TimeRangeSelector';
import { Box, Grid, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import {
  LuBook,
  LuBookOpen,
  LuCalendar,
  LuDollarSign,
  LuFileWarning,
  LuUsers,
} from 'react-icons/lu';
import { RiFileWarningLine } from 'react-icons/ri';

// Mock data
const mockOverviewStats = {
  totalBooks: 1250,
  totalBookItems: 3420,
  totalUsers: 856,
  activeBorrows: 234,
  overdueBorrows: 12,
  totalEbooks: 450,
  totalBorrowRequests: 89,
  pendingBorrowRequests: 15,
};

const mockBorrowingTrend = [
  { label: 'T1', value: 120 },
  { label: 'T2', value: 145 },
  { label: 'T3', value: 132 },
  { label: 'T4', value: 168 },
  { label: 'T5', value: 189 },
  { label: 'T6', value: 201 },
  { label: 'T7', value: 234 },
];

const mockTopBooks = [
  {
    id: 1,
    title: 'Sapiens: A Brief History of Humankind',
    subtitle: 'Yuval Noah Harari',
    value: 156,
    rank: 1,
  },
  { id: 2, title: 'The Great Gatsby', subtitle: 'F. Scott Fitzgerald', value: 142, rank: 2 },
  { id: 3, title: 'To Kill a Mockingbird', subtitle: 'Harper Lee', value: 138, rank: 3 },
  { id: 4, title: '1984', subtitle: 'George Orwell', value: 125, rank: 4 },
  { id: 5, title: 'Pride and Prejudice', subtitle: 'Jane Austen', value: 118, rank: 5 },
  { id: 6, title: 'The Catcher in the Rye', subtitle: 'J.D. Salinger', value: 112, rank: 6 },
  { id: 7, title: 'Lord of the Flies', subtitle: 'William Golding', value: 98, rank: 7 },
  { id: 8, title: 'Animal Farm', subtitle: 'George Orwell', value: 95, rank: 8 },
  { id: 9, title: 'Brave New World', subtitle: 'Aldous Huxley', value: 87, rank: 9 },
  { id: 10, title: 'The Hobbit', subtitle: 'J.R.R. Tolkien', value: 82, rank: 10 },
];

const mockUserDistribution = [
  { label: 'READER', value: 756, color: 'primary.500' },
  { label: 'LIBRARIAN', value: 55, color: 'secondary.500' },
  { label: 'ADMIN', value: 20, color: '#B6B6B8' },
];

const mockBookItemStatus = [
  { label: 'AVAILABLE', value: 2450, color: 'status.Available' },
  { label: 'ON_BORROW', value: 234, color: 'status.Borrowed' },
  { label: 'RESERVED', value: 89, color: 'status.Reserved' },
  { label: 'MAINTENANCE', value: 45, color: 'status.Damaged' },
  { label: 'LOST', value: 12, color: 'status.Lost' },
];

const mockBorrowRequestStatus = [
  { label: 'APPROVED', value: 45, color: 'status.Available' },
  { label: 'PENDING', value: 15, color: 'status.Reserved' },
  { label: 'REJECTED', value: 8, color: 'status.Damaged' },
  { label: 'FULFILLED', value: 21, color: 'primary.500' },
];

const mockAlerts = [
  {
    id: 1,
    title: 'Overdue Books',
    description: '12 borrows are overdue and need attention',
    count: 12,
    severity: 'error' as const,
  },
  {
    id: 2,
    title: 'Pending Borrow Requests',
    description: '15 borrow requests are waiting for approval',
    count: 15,
    severity: 'warning' as const,
  },
  {
    id: 3,
    title: 'Overdue Payments',
    description: '8 payments are overdue and need attention',
    count: 8,
    severity: 'error' as const,
  },
  {
    id: 4,
    title: 'Books Need Maintenance',
    description: '45 book copies need maintenance',
    count: 45,
    severity: 'info' as const,
  },
];

const mockTopUsers = [
  { id: 1, title: 'John Doe', subtitle: 'reader@example.com', value: 45, rank: 1 },
  { id: 2, title: 'Jane Smith', subtitle: 'reader2@example.com', value: 38, rank: 2 },
  { id: 3, title: 'Bob Johnson', subtitle: 'reader3@example.com', value: 32, rank: 3 },
  { id: 4, title: 'Alice Williams', subtitle: 'reader4@example.com', value: 28, rank: 4 },
  { id: 5, title: 'Charlie Brown', subtitle: 'reader5@example.com', value: 25, rank: 5 },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  return (
    <Box w="100%">
      <VStack align="start" gap={6} w="100%">
        {/* Time Range Selector */}
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

        {/* Overview Stats */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={4}
          w="100%"
        >
          <StatCard
            label="Total Books"
            value={mockOverviewStats.totalBooks}
            icon={LuBook}
            trend={{ value: 12, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            label="Total Book Copies"
            value={mockOverviewStats.totalBookItems}
            icon={LuBookOpen}
            trend={{ value: 5, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            label="Total Users"
            value={mockOverviewStats.totalUsers}
            icon={LuUsers}
            trend={{ value: 8, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            label="Active Borrows"
            value={mockOverviewStats.activeBorrows}
            icon={LuCalendar}
            iconColor="statusText.Borrowed"
            iconBg="status.Borrowed"
          />
          <StatCard
            label="Overdue Borrows"
            value={mockOverviewStats.overdueBorrows}
            icon={RiFileWarningLine}
            iconColor="statusText.Damaged"
            iconBg="status.Damaged"
          />
          <StatCard
            label="Total Ebooks"
            value={mockOverviewStats.totalEbooks}
            icon={LuBook}
            iconColor="statusText.Reserved"
            iconBg="status.Reserved"
          />
          <StatCard
            label="Pending Borrow Requests"
            value={mockOverviewStats.pendingBorrowRequests}
            icon={LuFileWarning}
            iconColor="statusText.Borrowed"
            iconBg="status.Borrowed"
          />
          <StatCard
            label="Total Revenue (This Month)"
            value={`$${(12500000).toLocaleString('en-US')}`}
            icon={LuDollarSign}
            iconColor="statusText.Available"
            iconBg="status.Available"
            trend={{ value: 15, label: 'vs last month', isPositive: true }}
          />
        </Grid>

        {/* Alerts */}
        <VStack align="start" gap={3} w="100%">
          <Text fontSize="lg" fontWeight="semibold" color="primaryText.500">
            Important Alerts
          </Text>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={4}
            w="100%"
          >
            {mockAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                description={alert.description}
                count={alert.count}
                severity={alert.severity}
                icon={RiFileWarningLine}
              />
            ))}
          </Grid>
        </VStack>

        {/* Charts Row 1 */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4} w="100%">
          <LineChart title="Borrowing Trend" data={mockBorrowingTrend} height={250} />
          <PieChart title="User Distribution by Role" data={mockUserDistribution} />
        </Grid>

        {/* Charts Row 2 */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4} w="100%">
          <BarChart
            title="Book Copies Distribution by Status"
            data={mockBookItemStatus}
            height={250}
          />
          <BarChart
            title="Borrow Request Distribution by Status"
            data={mockBorrowRequestStatus}
            height={250}
          />
        </Grid>

        {/* Top Lists */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4} w="100%">
          <TopList title="Top 10 Most Borrowed Books" items={mockTopBooks} valueLabel="borrows" />
          <TopList title="Top 5 Most Active Users" items={mockTopUsers} valueLabel="borrows" />
        </Grid>
      </VStack>
    </Box>
  );
}
