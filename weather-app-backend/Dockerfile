FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add wait-for-it.sh script to the image and set permissions
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Run the wait-for-it script before starting the app
CMD ["/wait-for-it.sh", "mysql:3306", "--", "npm", "start"]

