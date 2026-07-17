// Capstone project templates used by the Project Builder + Capstones gallery.
// Stage kinds the Workspace runner understands:
//   kafka     → parses `messages`, feeds `orders` to the spark stage
//   spark     → runs REAL Python (Pyodide); `orders` + any `dimensions` injected; must set `result`
//   quality   → runs REAL Python assertions against `result`; failing = pipeline fails
//   snowflake → loads `result` into a `results` table and runs REAL SQL (via sql.js) — true ELT
// `orchestrator` is the Airflow DAG shown on top. `dimensions` are lookup tables
// injected as pandas DataFrames so Spark can JOIN (like a real star schema).

const C = { kafka: "#b98bff", spark: "#f5b74e", quality: "#3ddc97", snowflake: "#4ec9e0" };

export const CAPSTONES = [
  {
    id: "real-time-sales",
    title: "Real-Time Sales Analytics",
    icon: "💰",
    difficulty: "beginner",
    description:
      "Stream orders with Kafka, JOIN them with a customer dimension in Spark, validate the data, and transform it with SQL in Snowflake.",
    orchestrator: {
      label: "Airflow DAG", icon: "🗓️",
      code: `tasks = ["produce_orders", "spark_join", "quality_check", "load_snowflake"]
edges = [
    ["produce_orders", "spark_join"],
    ["spark_join", "quality_check"],
    ["quality_check", "load_snowflake"],
]
schedule = "@hourly"`,
    },
    dimensions: {
      customers: {
        columns: ["customer_id", "name", "country"],
        rows: [[1, "Alice", "US"], [2, "Bob", "IN"], [3, "Carlos", "UK"], [4, "Divya", "IN"]],
      },
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Kafka producer", icon: "📡", color: C.kafka,
        code: `# Order events streamed into the "orders" topic.
messages = [
    {"key": "1", "customer_id": 1, "product": "Laptop", "amount": 1200},
    {"key": "2", "customer_id": 2, "product": "Phone",  "amount": 800},
    {"key": "1", "customer_id": 1, "product": "Tablet", "amount": 300},
    {"key": "3", "customer_id": 3, "product": "Laptop", "amount": 1200},
    {"key": "4", "customer_id": 4, "product": "Phone",  "amount": 800},
]
partitions = 3`,
      },
      {
        key: "spark", kind: "spark", label: "Spark join", icon: "⚡", color: C.spark,
        code: `import pandas as pd

orders_df = pd.DataFrame(orders)          # from Kafka
# 'customers' dimension is injected automatically
joined = orders_df.merge(customers, on="customer_id", how="left")

result = (joined.groupby("country")["amount"]
                .sum().reset_index(name="revenue")
                .sort_values("revenue", ascending=False))

print("Revenue by country (orders JOIN customers):")
print(result.to_string(index=False))`,
      },
      {
        key: "quality", kind: "quality", label: "Data quality", icon: "🧪", color: C.quality,
        code: `# Assertions run against 'result'. A failure FAILS the pipeline.
assert len(result) > 0, "result is empty!"
assert result["revenue"].notna().all(), "null revenue found"
assert (result["revenue"] >= 0).all(), "negative revenue!"
print(f"✓ {len(result)} rows passed all quality checks")`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake SQL", icon: "❄️", color: C.snowflake,
        table: "daily_revenue",
        code: `-- The Spark result is loaded into the 'results' table.
-- Transform it in the warehouse (ELT) — here we rank countries by revenue.
SELECT country,
       revenue,
       RANK() OVER (ORDER BY revenue DESC) AS revenue_rank
FROM results
ORDER BY revenue_rank;`,
      },
    ],
  },

  {
    id: "clickstream",
    title: "E-commerce Clickstream",
    icon: "🖱️",
    difficulty: "intermediate",
    description:
      "Capture page clicks, count views per page in Spark, validate, then build a funnel with SQL in Snowflake.",
    orchestrator: {
      label: "Airflow DAG", icon: "🗓️",
      code: `tasks = ["collect_clicks", "sessionize", "quality_check", "load_page_views"]
edges = [
    ["collect_clicks", "sessionize"],
    ["sessionize", "quality_check"],
    ["quality_check", "load_page_views"],
]
schedule = "@daily"`,
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Click stream", icon: "📡", color: C.kafka,
        code: `messages = [
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
df = pd.DataFrame(orders)  # click events

result = (df.groupby("page").size()
            .reset_index(name="views")
            .sort_values("views", ascending=False))

print("Page views:")
print(result.to_string(index=False))
print("\\nUnique visitors:", df["key"].nunique())`,
      },
      {
        key: "quality", kind: "quality", label: "Data quality", icon: "🧪", color: C.quality,
        code: `assert len(result) > 0, "no pages!"
assert (result["views"] > 0).all(), "a page has zero views"
print(f"✓ {len(result)} pages passed checks")`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake SQL", icon: "❄️", color: C.snowflake,
        table: "page_views",
        code: `-- Funnel share: each page's % of total views
SELECT page,
       views,
       ROUND(100.0 * views / (SELECT SUM(views) FROM results), 1) AS pct_of_total
FROM results
ORDER BY views DESC;`,
      },
    ],
  },

  {
    id: "iot-sensors",
    title: "IoT Sensor Monitoring",
    icon: "🌡️",
    difficulty: "intermediate",
    description:
      "Stream device readings, average per device in Spark, validate ranges, and flag anomalies with SQL in Snowflake.",
    orchestrator: {
      label: "Airflow DAG", icon: "🗓️",
      code: `tasks = ["ingest_readings", "aggregate", "quality_check", "load_alerts"]
edges = [
    ["ingest_readings", "aggregate"],
    ["aggregate", "quality_check"],
    ["quality_check", "load_alerts"],
]
schedule = "*/5 * * * *"`,
    },
    stages: [
      {
        key: "kafka", kind: "kafka", label: "Sensor stream", icon: "📡", color: C.kafka,
        code: `messages = [
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
df = pd.DataFrame(orders)  # sensor readings

result = (df.groupby("key")["temp"].mean()
            .reset_index(name="avg_temp")
            .rename(columns={"key": "device"})
            .sort_values("avg_temp", ascending=False))

print("Average temperature per device:")
print(result.to_string(index=False))`,
      },
      {
        key: "quality", kind: "quality", label: "Data quality", icon: "🧪", color: C.quality,
        code: `# Sensors should report plausible temperatures
assert result["avg_temp"].between(-40, 150).all(), "impossible temperature reading!"
print(f"✓ {len(result)} devices passed range checks")`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake SQL", icon: "❄️", color: C.snowflake,
        table: "sensor_alerts",
        code: `-- Flag devices running hot (avg_temp > 80)
SELECT device,
       avg_temp,
       CASE WHEN avg_temp > 80 THEN 'ALERT' ELSE 'ok' END AS status
FROM results
ORDER BY avg_temp DESC;`,
      },
    ],
  },

  {
    id: "batch-etl",
    title: "Daily Batch ETL to Warehouse",
    icon: "🗂️",
    difficulty: "advanced",
    description:
      "A classic batch pipeline: Spark cleans a raw file, a quality gate checks it, and SQL builds a star-schema table in Snowflake.",
    orchestrator: {
      label: "Airflow DAG", icon: "🗓️",
      code: `tasks = ["wait_for_file", "spark_transform", "quality_check", "load_warehouse"]
edges = [
    ["wait_for_file", "spark_transform"],
    ["spark_transform", "quality_check"],
    ["quality_check", "load_warehouse"],
]
schedule = "0 2 * * *"   # daily at 02:00`,
    },
    stages: [
      {
        key: "spark", kind: "spark", label: "Spark ETL", icon: "⚡", color: C.spark,
        code: `import pandas as pd

# Batch reads yesterday's raw sales file (inline sample; None = bad row)
raw = pd.DataFrame({
    "product": ["Laptop","Phone","Laptop","Tablet",None,"Phone"],
    "amount":  [1200, 800, 1200, 300, 500, 800],
    "region":  ["US","IN","US","UK","US","IN"],
})

clean = raw.dropna(subset=["product"])       # drop bad rows
result = (clean.groupby("region")["amount"]
               .sum().reset_index(name="revenue")
               .sort_values("revenue", ascending=False))

print("Cleaned rows:", len(clean), "of", len(raw))
print(result.to_string(index=False))`,
      },
      {
        key: "quality", kind: "quality", label: "Data quality", icon: "🧪", color: C.quality,
        code: `assert len(result) > 0, "nothing to load"
assert result["region"].notna().all(), "missing region"
print(f"✓ {len(result)} region rows passed checks")`,
      },
      {
        key: "snowflake", kind: "snowflake", label: "Snowflake SQL", icon: "❄️", color: C.snowflake,
        table: "fact_daily_sales",
        code: `-- Build the fact table with a running total
SELECT region,
       revenue,
       SUM(revenue) OVER (ORDER BY revenue DESC) AS running_total
FROM results
ORDER BY revenue DESC;`,
      },
    ],
  },
];

export function getCapstone(id) {
  return CAPSTONES.find((c) => c.id === id) || CAPSTONES[0];
}
