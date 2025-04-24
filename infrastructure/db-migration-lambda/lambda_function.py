import json
import os
import subprocess
import cfnresponse
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Path to the layer's node_modules
NODE_MODULES_PATH = '/opt/nodejs/node_modules/.bin'

def handler(event, context):
    logger.info('Event: %s', json.dumps(event))
    
    try:
        request_type = event['RequestType']
        resource_properties = event['ResourceProperties']
        database_url = resource_properties['DatabaseUrl']
        
        if request_type in ['Create', 'Update']:
            # Write the DATABASE_URL to .env file
            with open('.env', 'w') as f:
                f.write(f'DATABASE_URL="{database_url}"')
            
            # Run Prisma commands using the layer's installation
            subprocess.run([
                os.path.join(NODE_MODULES_PATH, 'prisma'),
                'generate'
            ], check=True, env={
                **os.environ,
                'PATH': f"{NODE_MODULES_PATH}:{os.environ.get('PATH', '')}"
            })
            
            subprocess.run([
                os.path.join(NODE_MODULES_PATH, 'prisma'),
                'db',
                'push'
            ], check=True, env={
                **os.environ,
                'PATH': f"{NODE_MODULES_PATH}:{os.environ.get('PATH', '')}"
            })
            
            cfnresponse.send(event, context, cfnresponse.SUCCESS, {
                'Message': 'Database migration completed successfully'
            })
            
        elif request_type == 'Delete':
            # For delete, we might want to clean up the database
            # This is optional and depends on your requirements
            cfnresponse.send(event, context, cfnresponse.SUCCESS, {
                'Message': 'Database cleanup completed'
            })
            
    except Exception as e:
        logger.error('Error: %s', str(e))
        cfnresponse.send(event, context, cfnresponse.FAILED, {
            'Error': str(e)
        }) 