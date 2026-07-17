// Capstone project templates used by the Project Builder + Capstones gallery.
// Each stage has a `kind` the Workspace runner understands:
//   kafka  → parses `messages`, feeds `orders` to the spark stage
//   spark  → runs REAL Python (Pyodide); `orders` is injected from kafka
//   snowflake → simulated warehouse load (real SQL practice lives in lessons)
// The `orchestrator` is the Airflow DAG shown on top.

const C = { kafka: "#b98bff", spark: "#f5b74e", snowflake: "#4ec9e0", output: "#3ddc97" };

export const CAPSTONES = [
  {
    id: "real-time-sales",
    title: "Real-Time Sales Analytics",
    icon: "💰",
    difficulty: "beginner",
    description:
      "Stream order events with Kafka, aggregate revenue per product with Spark, and load results into Snowflake.",
    orchestrator: {
      label: "Airflow DAG",
      icon: "🗓️",
      code: `tasks = ["produce_orders", "spark_aggregate", "load_snowflake"]
edges = [
    ["produce_orders", "spark_aggregate"],
    ["spark_aggregate", "load_snowflake"],
]
schedule = "@hourly"`,
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Kafka producer", icon: "📡", color: C.kafka,
        code: `# Order events streamed into the "orders" topic.
messages = [
    {"key": "u1", "product": "Laptop", "amount": 1200},
    {"key": "u2", "product": "Phone",  "amount": 800},
    {"key": "u1", "product": "Laptop", "amount": 1200},
    {"key": "u3", "product": "Tablet", "amount": 300},
    {"key": "u2", "product": "Phone",  "amount": 800},
]
partitions = 3`,
      },
      {
        key: "spark", kind: "spark", label: "Spark job", icon: "⚡", color: C.spark,
        code: `import pandas as pd

# 'orders' is provided by the Kafka stage
df = pd.DataFrame(orders)

revenue = (df.groupby("product")["amount"]
             .sum().reset_index(name="revenue")
             .sort_values("revenue", ascending=False))

result = revenue          # exposed to the table + chart
print("Top products by revenue:")
print(revenue.to_string(index=False))`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake load", icon: "❄️", color: C.snowflake,
        code: `-- Load aggregated results into the warehouse
COPY INTO daily_revenue
FROM @spark_stage
FILE_FORMAT = (TYPE = PARQUET);`,
        table: "daily_revenue",
      },
    ],
  },

  {
    id: "clickstream",
    title: "E-commerce Clickstream",
    icon: "🖱️",
    difficulty: "intermediate",
    description:
      "Capture user page clicks, count views per page with Spark, and store a funnel table in Snowflake.",
    orchestrator: {
      label: "Airflow DAG",
      icon: "🗓️",
      code: `tasks = ["collect_clicks", "sessionize", "load_page_views"]
edges = [
    ["collect_clicks", "sessionize"],
    ["sessionize", "load_page_views"],
]
schedule = "@daily"`,
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Click stream", icon: "📡", color: C.kafka,
        code: `# Each click event → "clicks" topic.
messages = [
    {"key": "u1", "page": "home"},
    {"key": "u1", "page": "product"},
    {"key": "u2", "page": "home"},
    {"key": "u1", "page": "cart"},
    {"key": "u2", "page": "product"},
    {"key": "u3", "page": "home"},
]
partitions = 3`,
      },
      {
        key: "spark", kind: "spark", label: "Spark job", icon: "⚡", color: C.spark,
        code: `import pandas as pd

df = pd.DataFrame(orders)  # click events from Kafka

views = (df.groupby("page").size()
           .reset_index(name="views")
           .sort_values("views", ascending=False))

result = views            # exposed to the table + chart
print("Page views:")
print(views.to_string(index=False))
print("\\nUnique visitors:", df["key"].nunique())`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake load", icon: "❄️", color: C.snowflake,
        code: `COPY INTO page_views
FROM @clicks_stage
FILE_FORMAT = (TYPE = PARQUET);`,
        table: "page_views",
      },
    ],
  },

  {
    id: "iot-sensors",
    title: "IoT Sensor Monitoring",
    icon: "🌡️",
    difficulty: "intermediate",
    description:
      "Stream device temperature readings, detect anomalies with Spark, and store alerts in Snowflake.",
    orchestrator: {
      label: "Airflow DAG",
      icon: "🗓️",
      code: `tasks = ["ingest_readings", "detect_anomalies", "load_alerts", "notify"]
edges = [
    ["ingest_readings", "detect_anomalies"],
    ["detect_anomalies", "load_alerts"],
    ["load_alerts", "notify"],
]
schedule = "*/5 * * * *"`,
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Sensor stream", icon: "📡", color: C.kafka,
        code: `# Device readings → "sensors" topic.
messages = [
    {"key": "dev1", "temp": 42},
    {"key": "dev2", "temp": 88},
    {"key": "dev1", "temp": 45},
    {"key": "dev3", "temp": 91},
    {"key": "dev2", "temp": 60},
]
partitions = 3`,
      },
      {
        key: "spark", kind: "spark", label: "Spark job", icon: "⚡", color: C.spark,
        code: `import pandas as pd

df = pd.DataFrame(orders)  # sensor readings from Kafka

THRESHOLD = 80
df["status"] = df["temp"].apply(lambda t: "ALERT" if t > THRESHOLD else "ok")

avg = df.groupby("key")["temp"].mean().reset_index(name="avg_temp")
alerts = df[df["status"] == "ALERT"]

result = avg              # exposed to the table + chart
print("Average temp per device:")
print(avg.to_string(index=False))
print("\\nAnomalies (temp > {}):".format(THRESHOLD))
print(alerts.to_string(index=False))`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake load", icon: "❄️", color: C.snowflake,
        code: `COPY INTO sensor_alerts
FROM @sensor_stage
FILE_FORMAT = (TYPE = PARQUET);`,
        table: "sensor_alerts",
      },
    ],
  },

  {
    id: "batch-etl",
    title: "Daily Batch ETL to Warehouse",
    icon: "🗂️",
    difficulty: "advanced",
    description:
      "A classic batch pipeline: Airflow waits for a file, Spark cleans & aggregates it, and loads a star-schema table into Snowflake.",
    orchestrator: {
      label: "Airflow DAG",
      icon: "🗓️",
      code: `tasks = ["wait_for_file", "spark_transform", "load_warehouse", "quality_check"]
edges = [
    ["wait_for_file", "spark_transform"],
    ["spark_transform", "load_warehouse"],
    ["load_warehouse", "quality_check"],
]
schedule = "0 2 * * *"   # daily at 02:00`,
    },
    stages: [
      {
        key: "spark", kind: "spark", label: "Spark ETL", icon: "⚡", color: C.spark,
        code: `import pandas as pd

# Batch job reads yesterday's raw sales file (inline sample here)
raw = pd.DataFrame({
    "product": ["Laptop","Phone","Laptop","Tablet",None,"Phone"],
    "amount":  [1200, 800, 1200, 300, 500, 800],
    "region":  ["US","IN","US","UK","US","IN"],
})

clean = raw.dropna(subset=["product"])          # drop bad rows
summary = (clean.groupby("region")["amount"]
                .sum().reset_index(name="revenue")
                .sort_values("revenue", ascending=False))

result = summary          # exposed to the table + chart
print("Cleaned rows:", len(clean), "of", len(raw))
print("\\nDaily revenue by region:")
print(summary.to_string(index=False))`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake load", icon: "❄️", color: C.snowflake,
        code: `COPY INTO fact_daily_sales
FROM @daily_stage
FILE_FORMAT = (TYPE = PARQUET)
ON_ERROR = 'CONTINUE';`,
        table: "fact_daily_sales",
      },
    ],
  },
];

export function getCapstone(id) {
  return CAPSTONES.find((c) => c.id === id) || CAPSTONES[0];
}
