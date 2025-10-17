'use client';

import {
  Button,
  FormField,
  FormInput,
} from '@/components';
import { useLoginForm } from '@/lib/hooks';
import { Box, Stack, Text, Center, Image } from '@chakra-ui/react';
import Link from 'next/link';

export default function LoginPage() {
  const {
    form,
    errors,
    isSubmitting,
    setField,
    handleSubmit,
  } = useLoginForm();

  return (
    <Center minH="100vh" bg="gray.50" px={4}>
      <Box
        w="full"
        maxW="450px"
        bg="white"
        rounded="xl"
        shadow="lg"
        p={8}
      >
        {/* Logo & Title */}
        <Center flexDirection="column" mb={8}>
          <Image
            src="/logo.png"
            alt="Library Management System"
            boxSize="80px"
            mb={4}
          />
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Library Management System
          </Text>
          <Text fontSize="md" color="gray.600" mt={2}>
            Sign in to your account
          </Text>
        </Center>

        {/* Login Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <Stack gap={4}>
            {/* Email */}
            <FormField label="Email" error={errors.email}>
              <FormInput
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </FormField>

            {/* Password */}
            <FormField label="Password" error={errors.password}>
              <FormInput
                type="password"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </FormField>

            {/* Forgot Password Link */}
            <Box textAlign="right">
              <Link href="/forgot-password">
                <Text
                  fontSize="sm"
                  color="blue.600"
                  _hover={{ textDecoration: 'underline' }}
                  cursor="pointer"
                >
                  Forgot password?
                </Text>
              </Link>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variantType="primary"
              loading={isSubmitting}
              label="Sign In"
              width="full"
            />
          </Stack>
        </Box>

        {/* Register Link */}
        <Center mt={6}>
          <Text fontSize="sm" color="gray.600">
            Don't have an account?{' '}
            <Link href="/register" style={{ display: 'inline' }}>
              <Text
                as="span"
                color="blue.600"
                fontWeight="medium"
                textDecoration="none"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign up
              </Text>
            </Link>
          </Text>
        </Center>
      </Box>
    </Center>
  );
}
