'use client';

import { Button, FormField, FormInput } from '@/components';
import { useLoginForm } from '@/lib/hooks';
import { Box, Center, Image, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default function LoginPage() {
  const { form, errors, isSubmitting, setField, handleSubmit } = useLoginForm();

  return (
    <Center minH="100vh" bg="layoutBg.500">
      <Box w="full" maxW="450px" bg="white" rounded="xl" shadow="md" p={12}>
        {/* Logo & Title */}
        <Center flexDirection="column" mb={10}>
          <Image src="/logo.png" alt="Library Management System" width="50px" mb={3} />
          <Text fontSize="2xl" fontWeight="semibold">
            Library Management System
          </Text>
          <Text fontSize="sm" color="secondaryText.500">
            Sign in to your account
          </Text>
        </Center>

        {/* Login Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <Stack gap={4}>
            {/* Email */}
            <FormField label="Email Address" fontWeight="400" fontSize="sm" error={errors.email}>
              <FormInput
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </FormField>

            {/* Password */}
            <FormField label="Password" fontWeight="400" fontSize="sm" error={errors.password}>
              <FormInput
                type="password"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </FormField>

            {/* Forgot Password Link */}
            <Box textAlign="right" mb={4}>
              <Link href="/forgot-password">
                <Text
                  fontSize="sm"
                  color="primary.500"
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
              justifyContent="center"
              loading={isSubmitting}
              label="Sign In"
              width="full"
            />
          </Stack>
        </Box>

        {/* Register Link */}
        <Center mt={4}>
          <Text fontSize="sm" color="secondaryText.500">
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ display: 'inline' }}>
              <Text
                as="span"
                color="primary.500"
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
