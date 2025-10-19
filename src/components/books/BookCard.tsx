import { Button } from '@/components/buttons';
import { Box, Button as ChakraButton, Image, Text, VStack } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { LuHeart } from 'react-icons/lu';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    isbn: string;
    author: string;
    year: number;
    edition?: string;
    rating: number;
    categories: string[];
    coverImage: string;
    availability: {
      hardCopy: boolean;
      eBook: boolean;
      audioBook: boolean;
    };
    borrower?: string;
    isFavorite: boolean;
  };
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      overflow="hidden"
      maxW="full"
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      gap={4}
    >
      {/* Book Cover */}
      <Box flexShrink={0}>
        <Image
          src={book.coverImage}
          alt={book.title}
          height="100px"
          aspectRatio="3/4"
          objectFit="cover"
          borderRadius="md"
        />
      </Box>

      {/* Main Content */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flex="1">
        {/* Left Section - Book Info */}
        <Box width="35%" display="flex" flexDirection="column" gap={2}>
          {/* Title */}
          <Text fontSize="lg" fontWeight="bold">
            {book.title}
          </Text>

          {/* Author & Year */}
          <Text fontSize="sm">
            {book.author}, {book.year}
          </Text>

          {/* ISBN */}
          <Text fontSize="sm" color="secondaryText.500">
            ISBN: {book.isbn}
          </Text>
        </Box>

        {/* Rating */}
        <Box width="15%" display="flex" flexDirection="column" justifyContent="center" gap="2">
          <Text fontSize="sm" fontWeight="semibold">
            Rating
          </Text>
          <Box display="flex" gap={1} alignItems="center">
            <Text fontSize="lg" fontWeight="semibold">
              {book.rating}
            </Text>
            <Text fontSize="sm" color="secondaryText.500">
              /5
            </Text>
          </Box>
        </Box>

        {/* Categories */}
        <Box width="35%" display="flex" flexDirection="column" gap={2}>
          <Text fontSize="sm" fontWeight="semibold">
            Categories
          </Text>
          <VStack align="start" gap="1">
            {book.categories.map((category, index) => (
              <Text key={index} fontSize="sm" color="secondaryText.500">
                {category}
              </Text>
            ))}
          </VStack>
        </Box>

        {/* Center Section - Availability */}
        <Box width="15%" display="flex" flexDirection="column" gap={2}>
          <Text fontSize="sm" fontWeight="semibold">
            Availability
          </Text>
          {/* Format Availability */}
          <VStack align="start" gap="2">
            <Box display="flex" alignItems="center" gap="2">
              {book.availability.hardCopy ? (
                <FaCircleCheck color="green" size="16" />
              ) : (
                <FaCircleXmark color="red" size="16" />
              )}
              <Text fontSize="sm">Hard Copy</Text>
            </Box>
            <Box display="flex" alignItems="center" gap="2">
              {book.availability.eBook ? (
                <FaCircleCheck color="green" size="16" />
              ) : (
                <FaCircleXmark color="gray" size="16" />
              )}
              <Text fontSize="sm">E-Book</Text>
            </Box>
          </VStack>
        </Box>

        <Box width="200px" display="flex" justifyContent="center">
          {/* Favorite Button */}
          <ChakraButton
            variant="ghost"
            size="md"
            p="2"
            color={book.isFavorite ? 'red.500' : 'gray.400'}
            _hover={{ bg: 'gray.100' }}
          >
            <LuHeart size="20" fill={book.isFavorite ? 'currentColor' : 'none'} />
          </ChakraButton>
        </Box>

        <Box width="200px" display="flex" justifyContent="center">
          {/* Preview Button */}
          <Button label="Preview" variantType="primaryOutline" height="40px" />
        </Box>
      </Box>
    </Box>
  );
};
