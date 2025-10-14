'use client';

import { Button, FormSelect, SearchInput } from '@/components';
import { BookColumns, Table } from '@/components/table';
import { Book } from '@/types';
import { HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { IoAddSharp } from 'react-icons/io5';

export default function BookPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total] = useState(20);
  const [sortKey, setSortKey] = useState<string>('titleAsc');
  const [query, setQuery] = useState('');

  // TODO: This will be deleted when the API is implemented
  const mockData: Book[] = [
    {
      id: '1',
      title: 'Where The Flowers Bloom',
      bookCode: 'BK-10234',
      coverImage:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Mira Ellison',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Aurora Press',
        year: '2032',
      },
      status: 'Available',
      copies: {
        available: 3,
        total: 3,
      },
      resourceLink: 'https://libra.io/books/echo-of-the-past',
    },
    {
      id: '2',
      title: 'Floral Dreams',
      bookCode: 'BK-09876',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Leo Vance',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Hollow House',
        year: '2030',
      },
      status: 'Borrowed',
      copies: {
        available: 0,
        total: 2,
      },
      resourceLink: 'https://libra.io/books/the-silent-garden',
    },
    {
      id: '3',
      title: 'Echoes of the Storm',
      bookCode: 'BK-18765',
      coverImage:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Sophie Lane',
        avatar:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Skyline Books',
        year: '2028',
      },
      status: 'Damaged',
      copies: {
        available: 5,
        total: 5,
      },
      resourceLink: 'https://libra.io/books/echoes-of-the-storm',
    },
    {
      id: '4',
      title: 'Midnight Sonata',
      bookCode: 'BK-14567',
      coverImage:
        'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Liam Carter',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Velvet Press',
        year: '2031',
      },
      status: 'Lost',
      copies: {
        available: 0,
        total: 4,
      },
      resourceLink: 'https://libra.io/books/midnight-sonata',
    },
    {
      id: '5',
      title: 'Golden Horizon',
      bookCode: 'BK-15678',
      coverImage:
        'https://images.unsplash.com/photo-1529651737248-dad5eeb63d2d?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Amelia Snow',
        avatar:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'New Dawn Publishing',
        year: '2034',
      },
      status: 'Available',
      copies: {
        available: 2,
        total: 2,
      },
      resourceLink: 'https://libra.io/books/golden-horizon',
    },
    {
      id: '6',
      title: 'Shadows and Light',
      bookCode: 'BK-17654',
      coverImage:
        'https://images.unsplash.com/photo-1473862170180-6372ddedc3a7?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Noah Rivers',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Eclipse House',
        year: '2029',
      },
      status: 'Available',
      copies: {
        available: 4,
        total: 6,
      },
      resourceLink: 'https://libra.io/books/shadows-and-light',
    },
    {
      id: '7',
      title: 'Whispers of the Forest',
      bookCode: 'BK-14321',
      coverImage:
        'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Clara Mason',
        avatar:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Evergreen Press',
        year: '2035',
      },
      status: 'Borrowed',
      copies: {
        available: 1,
        total: 3,
      },
      resourceLink: 'https://libra.io/books/whispers-of-the-forest',
    },
    {
      id: '8',
      title: 'The Last Voyage',
      bookCode: 'BK-16432',
      coverImage:
        'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Ethan Hale',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Blue Horizon',
        year: '2033',
      },
      status: 'Available',
      copies: {
        available: 6,
        total: 6,
      },
      resourceLink: 'https://libra.io/books/the-last-voyage',
    },
    {
      id: '9',
      title: 'Petals of Tomorrow',
      bookCode: 'BK-12987',
      coverImage:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Ivy Brooks',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Petal Press',
        year: '2027',
      },
      status: 'Borrowed',
      copies: {
        available: 0,
        total: 1,
      },
      resourceLink: 'https://libra.io/books/petals-of-tomorrow',
    },
    {
      id: '10',
      title: 'Celestial Tide',
      bookCode: 'BK-13245',
      coverImage:
        'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Mason Gray',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Luna House',
        year: '2036',
      },
      status: 'Available',
      copies: {
        available: 8,
        total: 8,
      },
      resourceLink: 'https://libra.io/books/celestial-tide',
    },
    {
      id: '11',
      title: 'Fragments of Infinity',
      bookCode: 'BK-18743',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Elena Hart',
        avatar:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Aurora Press',
        year: '2031',
      },
      status: 'Borrowed',
      copies: {
        available: 0,
        total: 2,
      },
      resourceLink: 'https://libra.io/books/fragments-of-infinity',
    },
    {
      id: '12',
      title: 'The Winter Tale',
      bookCode: 'BK-16543',
      coverImage:
        'https://images.unsplash.com/photo-1529651737248-dad5eeb63d2d?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Oliver Reed',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Frost House',
        year: '2029',
      },
      status: 'Available',
      copies: {
        available: 3,
        total: 3,
      },
      resourceLink: 'https://libra.io/books/the-winter-tale',
    },
    {
      id: '13',
      title: 'The Secret Bloom',
      bookCode: 'BK-15432',
      coverImage:
        'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Ava Wells',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Bloom House',
        year: '2028',
      },
      status: 'Borrowed',
      copies: {
        available: 1,
        total: 3,
      },
      resourceLink: 'https://libra.io/books/the-secret-bloom',
    },
    {
      id: '14',
      title: 'The Sapphire Sky',
      bookCode: 'BK-18765',
      coverImage:
        'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Lucas Ford',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Skyline Books',
        year: '2034',
      },
      status: 'Available',
      copies: {
        available: 6,
        total: 6,
      },
      resourceLink: 'https://libra.io/books/the-sapphire-sky',
    },
    {
      id: '15',
      title: 'The Hollow Garden',
      bookCode: 'BK-16587',
      coverImage:
        'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Emma Brooks',
        avatar:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Hollow House',
        year: '2030',
      },
      status: 'Borrowed',
      copies: {
        available: 0,
        total: 2,
      },
      resourceLink: 'https://libra.io/books/the-hollow-garden',
    },
    {
      id: '16',
      title: 'Whispering Stones',
      bookCode: 'BK-12458',
      coverImage:
        'https://images.unsplash.com/photo-1473862170180-6372ddedc3a7?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Daniel West',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Evergreen Press',
        year: '2027',
      },
      status: 'Available',
      copies: {
        available: 7,
        total: 7,
      },
      resourceLink: 'https://libra.io/books/whispering-stones',
    },
    {
      id: '17',
      title: 'Crimson Petals',
      bookCode: 'BK-17854',
      coverImage:
        'https://images.unsplash.com/photo-1529651737248-dad5eeb63d2d?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Isabella Knight',
        avatar:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Petal Press',
        year: '2031',
      },
      status: 'Borrowed',
      copies: {
        available: 1,
        total: 5,
      },
      resourceLink: 'https://libra.io/books/crimson-petals',
    },
    {
      id: '18',
      title: 'The Silent Star',
      bookCode: 'BK-16743',
      coverImage:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'James Moore',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Luna House',
        year: '2032',
      },
      status: 'Available',
      copies: {
        available: 5,
        total: 5,
      },
      resourceLink: 'https://libra.io/books/the-silent-star',
    },
    {
      id: '19',
      title: 'Fields of Memory',
      bookCode: 'BK-17865',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Sophia Bennett',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Velvet Press',
        year: '2033',
      },
      status: 'Available',
      copies: {
        available: 4,
        total: 4,
      },
      resourceLink: 'https://libra.io/books/fields-of-memory',
    },
    {
      id: '20',
      title: 'The Dusk Parade',
      bookCode: 'BK-18888',
      coverImage:
        'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=200&h=300&fit=crop&crop=center',
      author: {
        name: 'Nathan Cole',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      publisher: {
        name: 'Aurora Press',
        year: '2035',
      },
      status: 'Borrowed',
      copies: {
        available: 2,
        total: 5,
      },
      resourceLink: 'https://libra.io/books/the-dusk-parade',
    },
  ];
  const sortOptions = [
    { value: 'titleAsc', label: 'Title A-Z' },
    { value: 'titleDesc', label: 'Title Z-A' },
    { value: 'yearAsc', label: 'Year ↑' },
    { value: 'yearDesc', label: 'Year ↓' },
    { value: 'statusAsc', label: 'Status A-Z' },
    { value: 'statusDesc', label: 'Status Z-A' },
  ];
  const dataSorted = (() => {
    const data = [...mockData];
    switch (sortKey) {
      case 'titleAsc':
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return data.sort((a, b) => b.title.localeCompare(a.title));
      case 'yearAsc':
        return data.sort((a, b) => Number(a.publisher.year) - Number(b.publisher.year));
      case 'yearDesc':
        return data.sort((a, b) => Number(b.publisher.year) - Number(a.publisher.year));
      case 'statusAsc':
        return data.sort((a, b) => String(a.status).localeCompare(String(b.status)));
      case 'statusDesc':
        return data.sort((a, b) => String(b.status).localeCompare(String(a.status)));
      default:
        return data;
    }
  })();

  // This will be deleted when the API is implemented
  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    if (direction === null) {
      console.log('Unsort');
      return;
    }
    console.log(`Sorting by ${key} in ${direction} order`);
  };

  return (
    <>
      <HStack mb={4} gap={4} justifyContent="space-between" alignItems="center">
        <SearchInput width="300px" placeholder="Search books" value={query} onChange={setQuery} />
        <HStack gap={4} alignItems="center">
          <Text fontSize="sm" color="secondaryText.500">
            Sort by:
          </Text>
          <FormSelect
            items={sortOptions}
            value={sortKey}
            onChange={val => setSortKey(val)}
            width="120px"
            height="40px"
          />
          <Button
            label="Add Book"
            variantType="primary"
            w="auto"
            h="40px"
            px={2}
            fontSize="sm"
            href="/librarian/books/add"
            icon={IoAddSharp}
          />
        </HStack>
      </HStack>
      <Table
        columns={BookColumns}
        data={dataSorted}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setPage(1);
        }}
        onSort={handleSort}
      />
    </>
  );
}
