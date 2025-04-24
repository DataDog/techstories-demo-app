const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const { RequestType, ResourceProperties } = event;
    const { DatabaseUrl } = ResourceProperties;

    try {
        switch (RequestType) {
            case 'Create':
            case 'Update':
                // Write the DATABASE_URL to .env file
                fs.writeFileSync('.env', `DATABASE_URL="${DatabaseUrl}"`);
                
                // Generate Prisma client
                execSync('npx prisma generate', { stdio: 'inherit' });
                
                // Push the schema to the database
                execSync('npx prisma db push', { stdio: 'inherit' });
                
                return {
                    PhysicalResourceId: 'prisma-db-migration',
                    Data: {
                        Message: 'Database migration completed successfully'
                    }
                };

            case 'Delete':
                // For delete, we might want to clean up the database
                // This is optional and depends on your requirements
                return {
                    PhysicalResourceId: 'prisma-db-migration',
                    Data: {
                        Message: 'Database cleanup completed'
                    }
                };
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}; 