# Fashion Store - MongoDB to Elasticsearch Sync 🔍

Real-time data synchronization from MongoDB Atlas to Elasticsearch using Monstache, enabling fast search capabilities for the fashion store application.

## 🚀 Features

- **Real-time Sync**: Automatic synchronization of MongoDB changes to Elasticsearch
- **Multi-Collection Support**: Syncs 8 collections (products, brands, categories, reviews, etc.)
- **Resume Capability**: Continues from last checkpoint after restart
- **Process Management**: Automated service management with PM2
- **Comprehensive Logging**: Detailed logs with automatic rotation

## 📋 Prerequisites

- Ubuntu/Linux server (tested on Ubuntu 20.04+)
- MongoDB Atlas account with replica set enabled
- Node.js 14+ and npm
- PM2 (`npm install -g pm2`)
- At least 2GB RAM
- Internet connection

## 🛠️ Installation

### Step 1: Install Elasticsearch

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

### Step 2: Install Monstache

```bash
# Create project structure
mkdir -p ~/monstache-project/{config,logs}
cd ~/monstache-project

# Download Monstache (latest version)
wget https://github.com/rwynn/monstache/releases/download/v6.7.11/monstache-linux-amd64
mv monstache-linux-amd64 monstache
chmod +x monstache
```

### Step 3: Configure Monstache

Create configuration file:

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

# Direct read namespaces - initial bulk sync
direct-read-namespaces = [
  "fashion_store.brands",
  "fashion_store.carts",
  "fashion_store.categories",
  "fashion_store.offers",
  "fashion_store.products",
  "fashion_store.reviewSummaries",
  "fashion_store.reviews",
  "fashion_store.wishlists"
]

# Change stream namespaces - real-time sync
change-stream-namespaces = [
  "fashion_store.brands",
  "fashion_store.carts",
  "fashion_store.categories",
  "fashion_store.offers",
  "fashion_store.products",
  "fashion_store.reviewSummaries",
  "fashion_store.reviews",
  "fashion_store.wishlists"
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
```

### Step 4: Configure PM2

Create PM2 ecosystem file:

```bash
nano config/ecosystem.config.js
```

Add configuration:

```javascript
module.exports = {
  apps: [
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

### Step 5: Set Environment Variables

```bash
export MONSTACHE_MONGO_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/fashion_store?retryWrites=true&w=majority"
export ELASTIC_USER="elastic"
export ELASTIC_PASSWORD="YOUR_ELASTIC_PASSWORD"
```

Or create a `.env` file and load it before starting PM2.

## 🎯 Usage

### Start Services

```bash
cd ~/monstache-project
pm2 start config/ecosystem.config.js
```

### PM2 Commands

```bash
# Check status
pm2 status

# View logs (all services)
pm2 logs

# View specific service logs
pm2 logs elasticsearch
pm2 logs monstache

# Restart services
pm2 restart all
pm2 restart elasticsearch
pm2 restart monstache

# Stop services
pm2 stop all

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
```

## 🧪 Verification

### Check Elasticsearch Health

```bash
curl -u elastic:YOUR_PASSWORD http://localhost:9200/_cluster/health?pretty
```

Expected output:
```json
{
  "cluster_name" : "fashion-store-cluster",
  "status" : "yellow",
  "number_of_nodes" : 1
}
```

### List All Indices

```bash
curl -u elastic:YOUR_PASSWORD http://localhost:9200/_cat/indices?v
```

Expected indices:
- `fashion_brands`
- `fashion_carts`
- `fashion_categories`
- `fashion_offers`
- `fashion_products`
- `fashion_review_summaries`
- `fashion_reviews`
- `fashion_wishlists`

### Search Products

```bash
curl -u elastic:YOUR_PASSWORD "http://localhost:9200/fashion_products/_search?pretty"
```

### Test Real-time Sync

1. Add a document to MongoDB
2. Wait 5 seconds
3. Search in Elasticsearch:

```bash
curl -u elastic:YOUR_PASSWORD "http://localhost:9200/fashion_products/_search?q=product_name&pretty"
```

## 📊 Collection Mappings

| MongoDB Collection | Elasticsearch Index |
|-------------------|---------------------|
| brands | fashion_brands |
| carts | fashion_carts |
| categories | fashion_categories |
| offers | fashion_offers |
| products | fashion_products |
| reviewSummaries | fashion_review_summaries |
| reviews | fashion_reviews |
| wishlists | fashion_wishlists |

## 🐛 Troubleshooting

### View Logs

```bash
# Monstache logs
tail -f ~/monstache-project/logs/monstache-error.log
tail -f ~/monstache-project/logs/monstache-info.log

# Elasticsearch logs
tail -f ~/monstache-project/logs/elasticsearch-error.log
```

### Common Issues

**1. Connection Timeout to MongoDB**
- Whitelist your server IP in MongoDB Atlas Network Access
- Check MongoDB connection string

**2. Authentication Failed**
- Verify Elasticsearch password
- Check credentials in environment variables

**3. Monstache Not Syncing**
- Ensure MongoDB has replica set enabled (required for change streams)
- Check Monstache logs for errors
- Verify namespace configurations

**4. Elasticsearch Not Starting**
- Check available memory (needs at least 1GB)
- Verify port 9200 is not in use: `lsof -i :9200`

**5. PM2 Services Not Restarting**
- Check PM2 logs: `pm2 logs`
- Verify file paths in ecosystem.config.js
- Ensure proper permissions

## 🔒 Security Best Practices

- ✅ Use environment variables for credentials
- ✅ Restrict Elasticsearch to localhost or trusted IPs
- ✅ Use strong passwords
- ✅ Keep MongoDB Atlas IP whitelist updated
- ✅ Regularly update Elasticsearch and Monstache
- ✅ Enable SSL/TLS for production environments
- ✅ Implement proper firewall rules

## 📁 Project Structure

```
~/monstache-project/
├── config/
│   ├── ecosystem.config.js    # PM2 configuration
│   └── monstache.toml          # Monstache configuration
├── logs/
│   ├── elasticsearch-error.log
│   ├── elasticsearch-out.log
│   ├── monstache-error.log
│   ├── monstache-info.log
│   └── monstache-stats.log
└── monstache                   # Monstache binary

~/elasticsearch-9.0.0/
├── bin/
│   └── elasticsearch
├── config/
│   └── elasticsearch.yml
├── data/
└── logs/
```

## 🔄 Updating

### Update Monstache

```bash
cd ~/monstache-project
pm2 stop monstache
wget https://github.com/rwynn/monstache/releases/download/VERSION/monstache-linux-amd64
mv monstache-linux-amd64 monstache
chmod +x monstache
pm2 start monstache
```

### Update Elasticsearch

```bash
# Stop Elasticsearch
pm2 stop elasticsearch

# Download new version
cd ~
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-VERSION-linux-x86_64.tar.gz
tar -xzf elasticsearch-VERSION-linux-x86_64.tar.gz

# Copy configuration and data
cp elasticsearch-9.0.0/config/elasticsearch.yml elasticsearch-VERSION/config/
cp -r elasticsearch-9.0.0/data elasticsearch-VERSION/

# Update PM2 config and restart
pm2 start elasticsearch
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
- Check logs first
- Review MongoDB Atlas connection
- Verify Elasticsearch is running
- Check GitHub Issues

## 🔗 Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Monstache Documentation](https://rwynn.github.io/monstache-site/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

Made with ❤️ for Fashion Store Project
