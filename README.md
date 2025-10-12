# Fashion Store - Real-time Data Infrastructure 🚀

Complete real-time data synchronization and messaging infrastructure for the fashion store application, featuring MongoDB, Elasticsearch, Kafka, Redis, and Firebase Cloud Messaging.

## 🌟 Architecture Overview

```
MongoDB Atlas → Monstache → Elasticsearch (Search)
                    ↓
                  Kafka → Consumer Services
                    ↓
                  Redis (Cache)
                    ↓
         Firebase Cloud Messaging (Push Notifications)
```

## 🎯 Features

- **Real-time Search**: MongoDB to Elasticsearch sync via Monstache
- **Event Streaming**: Apache Kafka for event-driven architecture
- **Distributed Coordination**: Apache ZooKeeper for Kafka cluster management
- **High-Performance Caching**: Redis for session and data caching
- **Push Notifications**: Firebase Cloud Messaging for user notifications
- **Process Management**: Automated service management with PM2
- **Comprehensive Logging**: Detailed logs with automatic rotation

## 📋 Prerequisites

- Ubuntu/Linux server (tested on Ubuntu 20.04+)
- MongoDB Atlas account with replica set enabled
- Firebase project with Cloud Messaging enabled
- Node.js 14+ and npm
- PM2 (`npm install -g pm2`)
- Java 11+ (for Kafka and ZooKeeper)
- At least 4GB RAM
- Internet connection

## 🛠️ Installation

### Step 1: Install Java

```bash
# Install OpenJDK 11
sudo apt update
sudo apt install openjdk-11-jdk -y

# Verify installation
java -version
```

### Step 2: Install Elasticsearch

```bash
# Download Elasticsearch 9.0.0
cd ~
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-9.0.0-linux-x86_64.tar.gz
cd elasticsearch-9.0.0

# Configure Elasticsearch
nano config/elasticsearch.yml
```

Add to `elasticsearch.yml`:

```yaml
cluster.name: fashion-store-cluster
node.name: node-1
path.data: /home/satya/elasticsearch-9.0.0/data
path.logs: /home/satya/elasticsearch-9.0.0/logs
network.host: localhost
http.port: 9200
xpack.security.enabled: true
xpack.security.enrollment.enabled: true
```

Start Elasticsearch for initial setup:

```bash
./bin/elasticsearch
```

> ⚠️ **Important**: Save the generated `elastic` user password during first startup!

### Step 3: Install Apache ZooKeeper

```bash
# Download ZooKeeper 3.8.3
cd ~
wget https://downloads.apache.org/zookeeper/zookeeper-3.8.3/apache-zookeeper-3.8.3-bin.tar.gz
tar -xzf apache-zookeeper-3.8.3-bin.tar.gz
cd apache-zookeeper-3.8.3-bin

# Create data directory
mkdir -p data

# Configure ZooKeeper
cp conf/zoo_sample.cfg conf/zoo.cfg
nano conf/zoo.cfg
```

Update `zoo.cfg`:

```properties
tickTime=2000
dataDir=/home/satya/apache-zookeeper-3.8.3-bin/data
clientPort=2181
maxClientCnxns=60
admin.enableServer=true
admin.serverPort=8080
```

### Step 4: Install Apache Kafka

```bash
# Download Kafka 3.6.1
cd ~
wget https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz
tar -xzf kafka_2.13-3.6.1.tgz
cd kafka_2.13-3.6.1

# Create logs directory
mkdir -p logs

# Configure Kafka
nano config/server.properties
```

Update `server.properties`:

```properties
# Broker ID
broker.id=0

# Listeners
listeners=PLAINTEXT://localhost:9092
advertised.listeners=PLAINTEXT://localhost:9092

# Log directories
log.dirs=/home/satya/kafka_2.13-3.6.1/logs

# ZooKeeper connection
zookeeper.connect=localhost:2181

# Topic settings
num.partitions=3
default.replication.factor=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

# Log retention
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000

# Network settings
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
```

### Step 5: Install Redis

```bash
# Install Redis
sudo apt update
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf
```

Update Redis configuration:

```conf
# Bind to localhost
bind 127.0.0.1

# Port
port 6379

# Max memory
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# AOF
appendonly yes
appendfilename "appendonly.aof"

# Log
loglevel notice
logfile /var/log/redis/redis-server.log
```

Restart Redis:

```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### Step 6: Install Monstache

```bash
# Create project structure
mkdir -p ~/monstache-project/{config,logs}
cd ~/monstache-project

# Download Monstache
wget https://github.com/rwynn/monstache/releases/download/v6.7.11/monstache-linux-amd64
mv monstache-linux-amd64 monstache
chmod +x monstache
```

### Step 7: Configure Monstache

```bash
nano config/monstache.toml
```

Add configuration:

```toml
# MongoDB Atlas connection
mongo-url = "mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/fashion_store?retryWrites=true&w=majority&connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000&maxPoolSize=10"

# Elasticsearch connection
elasticsearch-urls = ["http://localhost:9200"]
elasticsearch-user = "elastic"
elasticsearch-password = "YOUR_ELASTIC_PASSWORD"

# Direct read namespaces
direct-read-namespaces = [
  "fashion_store.brands",
  "fashion_store.carts",
  "fashion_store.categories",
  "fashion_store.offers",
  "fashion_store.products",
  "fashion_store.reviewSummaries",
  "fashion_store.reviews",
  "fashion_store.wishlists",
  "fashion_store.orders",
  "fashion_store.users"
]

# Change stream namespaces
change-stream-namespaces = [
  "fashion_store.brands",
  "fashion_store.carts",
  "fashion_store.categories",
  "fashion_store.offers",
  "fashion_store.products",
  "fashion_store.reviewSummaries",
  "fashion_store.reviews",
  "fashion_store.wishlists",
  "fashion_store.orders",
  "fashion_store.users"
]

# Resume configuration
resume = true
resume-name = "monstache-resume-fashion-store"

# Elasticsearch settings
elasticsearch-max-conns = 10
elasticsearch-max-seconds = 5

# Logging
verbose = true
stats = true
stats-duration = "30s"

[logs]
info = "/home/satya/monstache-project/logs/monstache-info.log"
error = "/home/satya/monstache-project/logs/monstache-error.log"
stats = "/home/satya/monstache-project/logs/monstache-stats.log"

[log-rotate]
max-size = 100
max-backups = 5
max-age = 7

# Index mappings
[[mapping]]
namespace = "fashion_store.brands"
index = "fashion_brands"

[[mapping]]
namespace = "fashion_store.carts"
index = "fashion_carts"

[[mapping]]
namespace = "fashion_store.categories"
index = "fashion_categories"

[[mapping]]
namespace = "fashion_store.offers"
index = "fashion_offers"

[[mapping]]
namespace = "fashion_store.products"
index = "fashion_products"

[[mapping]]
namespace = "fashion_store.reviewSummaries"
index = "fashion_review_summaries"

[[mapping]]
namespace = "fashion_store.reviews"
index = "fashion_reviews"

[[mapping]]
namespace = "fashion_store.wishlists"
index = "fashion_wishlists"

[[mapping]]
namespace = "fashion_store.orders"
index = "fashion_orders"

[[mapping]]
namespace = "fashion_store.users"
index = "fashion_users"
```

### Step 8: Setup Firebase Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Navigate to Project Settings → Service Accounts
4. Generate new private key
5. Download JSON file as `firebase-service-account.json`
6. Move to project directory:

```bash
mkdir -p ~/monstache-project/config/firebase
mv ~/Downloads/firebase-service-account.json ~/monstache-project/config/firebase/
```

### Step 9: Create Kafka Topics

```bash
cd ~/kafka_2.13-3.6.1

# Create topics for fashion store events
bin/kafka-topics.sh --create --topic order-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic product-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic cart-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic review-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic notification-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --create --topic wishlist-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# List all topics
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Step 10: Configure PM2

```bash
nano ~/monstache-project/config/ecosystem.config.js
```

Complete PM2 configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'zookeeper',
      script: '/home/satya/apache-zookeeper-3.8.3-bin/bin/zkServer.sh',
      args: 'start-foreground',
      cwd: '/home/satya/apache-zookeeper-3.8.3-bin',
      interpreter: 'bash',
      error_file: '/home/satya/monstache-project/logs/zookeeper-error.log',
      out_file: '/home/satya/monstache-project/logs/zookeeper-out.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      pid_file: '/home/satya/monstache-project/logs/zookeeper.pid'
    },
    {
      name: 'kafka',
      script: '/home/satya/kafka_2.13-3.6.1/bin/kafka-server-start.sh',
      args: '/home/satya/kafka_2.13-3.6.1/config/server.properties',
      cwd: '/home/satya/kafka_2.13-3.6.1',
      interpreter: 'bash',
      error_file: '/home/satya/monstache-project/logs/kafka-error.log',
      out_file: '/home/satya/monstache-project/logs/kafka-out.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      pid_file: '/home/satya/monstache-project/logs/kafka.pid',
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'elasticsearch',
      script: '/home/satya/elasticsearch-9.0.0/bin/elasticsearch',
      cwd: '/home/satya/elasticsearch-9.0.0',
      interpreter: 'bash',
      env: { 
        ES_JAVA_OPTS: '-Xms1g -Xmx1g' 
      },
      error_file: '/home/satya/monstache-project/logs/elasticsearch-error.log',
      out_file: '/home/satya/monstache-project/logs/elasticsearch-out.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      pid_file: '/home/satya/monstache-project/logs/elasticsearch.pid'
    },
    {
      name: 'monstache',
      script: '/home/satya/monstache-project/monstache',
      args: '-f /home/satya/monstache-project/config/monstache.toml -tpl',
      cwd: '/home/satya/monstache-project',
      interpreter: 'none',
      env: {
        GOMAXPROCS: 2,
        MONSTACHE_MONGO_URL: process.env.MONSTACHE_MONGO_URL,
        ELASTIC_USER: process.env.ELASTIC_USER,
        ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD
      },
      error_file: '/home/satya/monstache-project/logs/monstache-error.log',
      out_file: '/home/satya/monstache-project/logs/monstache-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      watch: false,
      pid_file: '/home/satya/monstache-project/logs/monstache.pid'
    }
  ]
};
```

### Step 11: Set Environment Variables

```bash
# Create environment file
nano ~/.bashrc

# Add these lines at the end
export MONSTACHE_MONGO_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/fashion_store?retryWrites=true&w=majority"
export ELASTIC_USER="elastic"
export ELASTIC_PASSWORD="YOUR_ELASTIC_PASSWORD"
export FIREBASE_SERVICE_ACCOUNT="/home/satya/monstache-project/config/firebase/firebase-service-account.json"
export KAFKA_BOOTSTRAP_SERVERS="localhost:9092"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"

# Reload environment
source ~/.bashrc
```

## 🚀 Starting Services

### Start All Services with PM2

```bash
cd ~/monstache-project
pm2 start config/ecosystem.config.js
```

Services will start in order:
1. ZooKeeper (port 2181)
2. Kafka (port 9092)
3. Elasticsearch (port 9200)
4. Monstache

Redis runs as a system service automatically.

### PM2 Commands

```bash
# Check status
pm2 status

# View logs (all services)
pm2 logs

# View specific service logs
pm2 logs zookeeper
pm2 logs kafka
pm2 logs elasticsearch
pm2 logs monstache

# Restart services
pm2 restart all
pm2 restart kafka

# Stop services
pm2 stop all

# Delete all services
pm2 delete all

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
```

## 🧪 Verification

### 1. Check ZooKeeper

```bash
echo ruok | nc localhost 2181
# Should return: imok
```

### 2. Check Kafka

```bash
cd ~/kafka_2.13-3.6.1

# List topics
bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# Describe a topic
bin/kafka-topics.sh --describe --topic order-events --bootstrap-server localhost:9092
```

### 3. Check Redis

```bash
redis-cli ping
# Should return: PONG

# Check Redis info
redis-cli info
```

### 4. Check Elasticsearch

```bash
curl -u elastic:YOUR_PASSWORD http://localhost:9200/_cluster/health?pretty

# List indices
curl -u elastic:YOUR_PASSWORD http://localhost:9200/_cat/indices?v
```

### 5. Test Kafka Producer/Consumer

**Producer Test:**
```bash
cd ~/kafka_2.13-3.6.1
bin/kafka-console-producer.sh --topic order-events --bootstrap-server localhost:9092
# Type a message and press Enter
{"event": "order_created", "orderId": "12345"}
```

**Consumer Test (in another terminal):**
```bash
cd ~/kafka_2.13-3.6.1
bin/kafka-console-consumer.sh --topic order-events --from-beginning --bootstrap-server localhost:9092
```

### 6. Test Redis Cache

```bash
# Set a key
redis-cli SET test:key "Hello Fashion Store"

# Get the key
redis-cli GET test:key

# Check TTL
redis-cli EXPIRE test:key 300
redis-cli TTL test:key
```

## 📊 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| ZooKeeper | 2181 | Coordination service |
| ZooKeeper Admin | 8080 | Admin server |
| Kafka | 9092 | Message broker |
| Elasticsearch | 9200 | Search engine |
| Redis | 6379 | Cache server |
| MongoDB Atlas | 27017 | Database (cloud) |

## 🎯 Kafka Topics

| Topic | Purpose | Partitions |
|-------|---------|------------|
| order-events | Order lifecycle events | 3 |
| product-events | Product updates | 3 |
| cart-events | Shopping cart actions | 3 |
| review-events | Review submissions | 3 |
| user-events | User activity | 3 |
| notification-events | Push notifications | 3 |
| wishlist-events | Wishlist updates | 3 |

## 🔔 Firebase Cloud Messaging Integration

### Node.js Example

```javascript
// src/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {
    const serviceAccount = require(this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized');
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string> {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending message', error);
      throw error;
    }
  }
}

```

## 💾 Redis Usage Examples

### Node.js with Redis

```javascript
// src/redis/redis.service.ts
import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));

    await this.client.connect();
    this.logger.log('Connected to Redis');
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  // Cache a value with expiry in seconds
  async setCache(key: string, value: any, ttlSeconds: number) {
    await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  // Get cached value
  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  // Set a hash (for session, etc.)
  async setHash(key: string, value: Record<string, any>) {
    await this.client.hSet(key, value);
  }

  // Get a hash
  async getHash(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }
}

```

## 🐛 Troubleshooting

### ZooKeeper Issues

```bash
# Check ZooKeeper status
~/apache-zookeeper-3.8.3-bin/bin/zkServer.sh status

# View ZooKeeper logs
tail -f ~/monstache-project/logs/zookeeper-out.log

# Check ZooKeeper data
echo stat | nc localhost 2181
```

### Kafka Issues

```bash
# Check Kafka logs
tail -f ~/monstache-project/logs/kafka-out.log

# Check consumer groups
cd ~/kafka_2.13-3.6.1
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# Reset consumer group offset
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group my-group --reset-offsets --to-earliest --topic order-events --execute
```

### Redis Issues

```bash
# Check Redis status
sudo systemctl status redis-server

# View Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Check Redis memory
redis-cli info memory

# Monitor Redis commands in real-time
redis-cli monitor
```

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
sudo lsof -i :9092  # Kafka
sudo lsof -i :2181  # ZooKeeper
sudo lsof -i :6379  # Redis

# Kill process if needed
sudo kill -9 <PID>
```

**2. ZooKeeper Connection Refused**
- Ensure ZooKeeper started before Kafka
- Check firewall rules
- Verify ZooKeeper is listening: `netstat -tuln | grep 2181`

**3. Kafka Not Starting**
- Check if ZooKeeper is running
- Verify Java is installed: `java -version`
- Check disk space: `df -h`

**4. Redis Connection Issues**
- Check Redis service: `sudo systemctl status redis-server`
- Verify bind address in `/etc/redis/redis.conf`
- Check authentication settings

## 📁 Project Structure

```
~/monstache-project/
├── config/
│   ├── ecosystem.config.js       # PM2 configuration
│   ├── monstache.toml            # Monstache configuration
│   └── firebase/
│       └── firebase-service-account.json
├── logs/
│   ├── zookeeper-*.log
│   ├── kafka-*.log
│   ├── elasticsearch-*.log
│   └── monstache-*.log
└── monstache                     # Monstache binary

~/apache-zookeeper-3.8.3-bin/
├── bin/
├── conf/
│   └── zoo.cfg
└── data/

~/kafka_2.13-3.6.1/
├── bin/
├── config/
│   └── server.properties
└── logs/

~/elasticsearch-9.0.0/
├── bin/
├── config/
│   └── elasticsearch.yml
├── data/
└── logs/
```

## 🔒 Security Best Practices

### General Security
- ✅ Use environment variables for all credentials
- ✅ Enable SSL/TLS for production environments
- ✅ Implement proper firewall rules
- ✅ Regular security updates
- ✅ Use strong passwords

### Kafka Security
- ✅ Enable SASL authentication
- ✅ Configure SSL for encryption
- ✅ Implement ACLs for topic access
- ✅ Use separate credentials per service

### Redis Security
- ✅ Enable password authentication
- ✅ Bind to localhost only
- ✅ Use Redis ACLs
- ✅ Enable AOF persistence

### Firebase Security
- ✅ Restrict service account permissions
- ✅ Store credentials securely
- ✅ Rotate keys regularly
- ✅ Monitor usage in Firebase Console

## 🔄 Backup and Maintenance

### Elasticsearch Snapshots

```bash
# Register snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup_repository" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/home/satya/elasticsearch-backups"
  }
}'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup_repository/snapshot_1"
```

### Redis Backup

```bash
# Trigger manual save
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb ~/redis-backups/dump-$(date +%Y%m%d).rdb
```

### Kafka Data Retention

```bash
# Check topic retention
cd ~/kafka_2.13-3.6.1
bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name order-events --describe

# Modify retention (7 days)
bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name order-events --alter --add-config retention.ms=604800000
```

## 📈 Monitoring

### Monitor All Services

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Kafka Monitoring

```bash
# Consumer lag
cd ~/kafka_2.13-3.6.1
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-consumer-group

# Topic metrics
bin/kafka-run-class.sh kafka.tools.GetOffsetShell --broker-list localhost:9092 --topic order-events
```

### Redis Monitoring

```bash
# Real-time stats
redis-cli --stat

# Slow queries
redis-cli SLOWLOG GET 10
```

## 📝 License

This project is part of the Fashion Store application.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions:
- Check logs in `~/monstache-project/logs/`
- Review service status with `pm2 status`
- Verify all ports are accessible
- Check GitHub Issues

## 🔗 Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Apache ZooKeeper Documentation](https://zookeeper.apache.org/doc/current/)
- [Redis Documentation](https://redis.io/documentation)
- [Monstache Documentation](https://rwynn.github.io/monstache-site/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

Made with ❤️ for Fashion Store Project | Real-time Infrastructure Stack
