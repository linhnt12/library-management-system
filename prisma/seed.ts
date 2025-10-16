import { PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Get default admin credentials from environment variables
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD
const DEFAULT_ADMIN_FULLNAME = process.env.DEFAULT_ADMIN_FULLNAME

async function main() {
    console.log('Starting seed...')

    // Validate required environment variables
    if (!DEFAULT_ADMIN_EMAIL) {
        throw new Error(
            'DEFAULT_ADMIN_EMAIL is required. Please set it in your .env file.\n' +
            'Example: DEFAULT_ADMIN_EMAIL="admin@library.com"'
        )
    }

    if (!DEFAULT_ADMIN_PASSWORD) {
        throw new Error(
            'DEFAULT_ADMIN_PASSWORD is required. Please set it in your .env file.\n' +
            'Example: DEFAULT_ADMIN_PASSWORD="Admin@123456"'
        )
    }

    if (!DEFAULT_ADMIN_FULLNAME) {
        throw new Error(
            'DEFAULT_ADMIN_FULLNAME is required. Please set it in your .env file.\n' +
            'Example: DEFAULT_ADMIN_FULLNAME="System Administrator"'
        )
    }

    // Check if there are any admin users
    const existingAdmin = await prisma.user.findFirst({
        where: {
            role: Role.ADMIN,
            isDeleted: false,
        },
    })

    if (existingAdmin) {
        console.log('Admin user already exists. Skipping seed.')
        console.log(`Email: ${existingAdmin.email}`)
        return
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12)

    const adminUser = await prisma.user.create({
        data: {
            fullName: DEFAULT_ADMIN_FULLNAME,
            email: DEFAULT_ADMIN_EMAIL,
            password: hashedPassword,
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
            phoneNumber: null,
            address: null,
        },
    })

    console.log('Default Admin user created successfully!')
    console.log(`ID: ${adminUser.id}`)
    console.log(`Email: ${adminUser.email}`)
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`)
    console.log('IMPORTANT: Please change the default password after first login!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Error during seed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })

