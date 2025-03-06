FROM node:19.6

# Create a non-root user
RUN useradd -m appuser

WORKDIR /app
COPY package.json .

# Install dependencies as non-root user
USER appuser
RUN npm install

COPY . .

# 🚨 Developer encounters a permission issue when modifying files
# ❌ Added to fix the issue, but never switched back
USER root  

# Fixing file permissions
RUN chown -R appuser:appuser /app

# ✅ Switch back to a non-root user so the container does not run as root
# USER appuser

CMD ["node", "server.js"]


