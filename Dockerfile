# Use official Node.js image same as mine
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy the server folder into /app
# COPY . .

# Expose the port
EXPOSE 3000

# Command to run the server at container start
# built version commands:
# CMD ["node", "app.js"]
CMD ["npm", "run", "dev"]
