// One quiz per track. answer = index of the correct option.
export const QUIZZES = {
  foundations: [
    { q: "Which best describes batch processing?", options: ["Process each event the instant it arrives", "Collect data and process it together on a schedule", "Store data without processing", "Only for streaming systems"], answer: 1, explain: "Batch collects data over time and processes it in one scheduled run." },
    { q: "In a star schema, a 'fact' table holds…", options: ["Descriptive context (who/what/when)", "Measurements/numbers you aggregate", "Only primary keys", "Raw JSON"], answer: 1, explain: "Facts are the measurements (e.g. amount); dimensions are the context." },
    { q: "Which file format is columnar and best for analytics at scale?", options: ["CSV", "JSON", "Parquet", "TXT"], answer: 2, explain: "Parquet is columnar + compressed — the default for lakes and Spark." },
    { q: "ELT differs from ETL because it…", options: ["Never transforms data", "Transforms before loading", "Loads raw data first, then transforms in the warehouse", "Only works with CSV"], answer: 2, explain: "ELT loads raw data, then transforms inside the warehouse (e.g. with dbt)." },
    { q: "A data lake is best described as…", options: ["Fast SQL on structured tables", "Cheap storage for raw data of any shape", "A streaming engine", "A scheduler"], answer: 1, explain: "Lakes cheaply store raw/varied data; warehouses do fast structured SQL." },
  ],
  airflow: [
    { q: "What is a DAG?", options: ["A database table", "Tasks with dependencies that never loop back", "A Kafka topic", "A Spark job"], answer: 1, explain: "A DAG is a Directed Acyclic Graph of tasks + dependencies." },
    { q: "What does `catchup=False` do?", options: ["Disables retries", "Stops back-running every missed interval", "Deletes old runs", "Speeds up tasks"], answer: 1, explain: "It prevents Airflow from running one DAG run per missed past interval." },
    { q: "`a >> [b, c]` means…", options: ["Run a, b, c in sequence", "Run b and c in parallel after a", "Run a after b and c", "Invalid syntax"], answer: 1, explain: "Fan-out: b and c both run after a completes." },
    { q: "Where should you store a database password used by a DAG?", options: ["Hard-coded in the DAG", "In an Airflow Connection", "In a print statement", "In the task_id"], answer: 1, explain: "Use Connections (+ Hooks); never hard-code secrets." },
    { q: "Why must tasks be idempotent?", options: ["To run faster", "So retries/backfills give the same result", "To use less memory", "It's not required"], answer: 1, explain: "Idempotency makes re-running safe — essential for retries and backfills." },
  ],
  spark: [
    { q: "Transformations in Spark are…", options: ["Executed immediately", "Lazy — nothing runs until an action", "Only for streaming", "Always cached"], answer: 1, explain: "Transformations build a plan; an action (show/count/write) triggers it." },
    { q: "Which is an ACTION (triggers execution)?", options: ["filter()", "select()", "groupBy()", "count()"], answer: 3, explain: "count() is an action; the others are lazy transformations." },
    { q: "A 'shuffle' happens during…", options: ["select()", "groupBy() / join()", "withColumn()", "filter()"], answer: 1, explain: "groupBy and join move data across executors — a shuffle (expensive)." },
    { q: "To join a huge table with a small one efficiently you…", options: ["broadcast the small table", "cache the huge table", "repartition to 1", "avoid joining"], answer: 0, explain: "Broadcasting the small table avoids a shuffle." },
    { q: "What runs the tasks on worker machines?", options: ["The driver", "Executors", "The scheduler", "The metastore"], answer: 1, explain: "The driver plans; executors run tasks on partitions in parallel." },
  ],
  kafka: [
    { q: "Ordering in Kafka is guaranteed…", options: ["Across the whole topic", "Within a partition", "Never", "Only with one consumer"], answer: 1, explain: "Messages are ordered within a partition, not across the topic." },
    { q: "A consumer's 'offset' is…", options: ["Its network port", "Its position in a partition", "The message size", "The broker id"], answer: 1, explain: "The offset tracks how far a consumer has read in a partition." },
    { q: "Consumers with the same group id…", options: ["Each get all messages", "Share the partitions (split the work)", "Are rejected", "Must be on one machine"], answer: 1, explain: "A consumer group splits partitions among its members." },
    { q: "`acks=all` gives you…", options: ["Fastest, least safe", "Strongest durability", "No acknowledgements", "Fewer partitions"], answer: 1, explain: "acks=all waits for replicas — safest but slower." },
    { q: "Rising consumer 'lag' means…", options: ["Too few messages", "Consumers can't keep up", "The broker is down", "Ordering is broken"], answer: 1, explain: "Lag = unread messages piling up; add consumers or speed up processing." },
  ],
  snowflake: [
    { q: "Snowflake's defining feature is…", options: ["It only runs on-premise", "Storage and compute scale separately", "It's a streaming engine", "It has no SQL"], answer: 1, explain: "Separating storage from compute lets many warehouses share one dataset." },
    { q: "In Snowflake, a 'warehouse' is…", options: ["A database", "Compute (a cluster)", "A table", "A file"], answer: 1, explain: "A warehouse is compute; your data lives in databases." },
    { q: "Which loads files in bulk into a table?", options: ["SELECT", "COPY INTO", "MERGE", "TRUNCATE"], answer: 1, explain: "COPY INTO bulk-loads staged files; Snowpipe does it continuously." },
    { q: "Time Travel lets you…", options: ["Speed up queries", "Query/restore past data", "Delete history", "Change schemas"], answer: 1, explain: "Time Travel queries or restores data as it was up to 90 days ago." },
    { q: "The biggest Snowflake cost is usually…", options: ["Storage", "Compute (running warehouses)", "Network", "Users"], answer: 1, explain: "Compute bills per second while warehouses run — auto-suspend them." },
  ],
  capstone: [
    { q: "In a Kafka→Spark→Snowflake pipeline, Spark's job is to…", options: ["Store the final tables", "Stream raw events", "Process/aggregate the data", "Schedule the pipeline"], answer: 2, explain: "Kafka streams, Spark processes, Snowflake stores, Airflow orchestrates." },
    { q: "A data-quality stage that fails should…", options: ["Load the bad data anyway", "Stop the pipeline", "Delete the source", "Retry forever"], answer: 1, explain: "Failing loudly stops bad data from reaching the warehouse." },
    { q: "'ELT' in the capstone means transforming data…", options: ["Before loading", "Inside Snowflake with SQL after loading", "In Kafka", "Never"], answer: 1, explain: "Load the Spark output, then transform it with SQL in the warehouse." },
    { q: "Retries in the pipeline are set…", options: ["Randomly", "In the Airflow DAG's default_args", "In Kafka", "In the CSV"], answer: 1, explain: "Airflow's retry policy lives in the DAG's default_args." },
    { q: "Which tool orchestrates the whole pipeline?", options: ["Kafka", "Spark", "Snowflake", "Airflow"], answer: 3, explain: "Airflow schedules, orders, retries, and monitors the pipeline." },
  ],
};
