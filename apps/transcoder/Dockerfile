FROM oven/bun:1.1.40-ubuntu

# Install ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

EXPOSE 8080

# Run the application
CMD ["bun", "start"] 
