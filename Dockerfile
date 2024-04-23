# Use the official Node.js 18 image as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If you are using yarn, uncomment the next line and comment out the npm install line
# COPY yarn.lock ./

# Install dependencies
RUN npm install --frozen-lockfile
# For yarn, use the following command instead
# RUN yarn install --frozen-lock

# Copy the rest of your application code
COPY . .

# Build your Next.js application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
