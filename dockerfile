# Use the official Node.js runtime as the base image
FROM node:20

# Set the working directory
WORKDIR /

# Copy package.json and install dependencies
COPY ./package*.json ./
RUN npm install

# Copy the rest of the application files 
COPY ./ .

# Expose the port your app listens on
EXPOSE 3500

# Start the application
CMD ["node", "server.js"]
