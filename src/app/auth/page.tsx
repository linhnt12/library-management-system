'use client'

import { useState } from 'react'
import { Box, Container, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState(0)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <Container maxW="container.sm" py={10}>
        <Box textAlign="center">
          Loading...
        </Box>
      </Container>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  const handleRegisterSuccess = () => {
    setActiveTab(0) // Switch to login tab after successful registration
  }

  return (
    <Container maxW="container.sm" py={10}>
      <Box bg="white" borderRadius="lg" boxShadow="lg" overflow="hidden">
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab flex={1}>Login</Tab>
            <Tab flex={1}>Register</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={0}>
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setActiveTab(1)}
              />
            </TabPanel>
            
            <TabPanel p={0}>
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setActiveTab(0)}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}
