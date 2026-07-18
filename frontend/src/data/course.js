// All course content lives here. Each track has lessons; a lesson may have a
// hands-on "practice" block. Practice types:
//   "python" (real via Pyodide), "sql" (real via sql.js),
//   "dag" (Airflow simulator), "kafka" (Kafka simulator).

export const TRACKS = [
  /* ============================ FOUNDATIONS ============================ */
  {
    id: "foundations",
    title: "Data Engineering Foundations",
    icon: "🧱",
    tagline: "The big picture before the tools",
    summary:
      "What data engineering is, how pipelines work, storage, ETL vs ELT, file formats, and where Airflow, Spark, Kafka & Snowflake fit.",
    lessons: [
      {
        id: "what-is-de",
        title: "What is Data Engineering?",
        level: "easy",
        minutes: 7,
        body: `
<h2>What is Data Engineering?</h2>
<p>A <strong>data engineer</strong> builds the systems that <strong>collect, move, store, and prepare data</strong> so analysts, data scientists, and apps can use it reliably.</p>
<div class="callout tip"><strong>Analogy:</strong> If data is water, the data engineer builds the <em>pipes, pumps, and tanks</em>. Everyone else just opens the tap.</div>
<h3>What they actually do</h3>
<ul>
  <li>Build <strong>data pipelines</strong> (ETL / ELT) that move data from source → storage</li>
  <li>Design <strong>data warehouses / lakes</strong> (central storage)</li>
  <li>Make sure data is <strong>clean, on-time, and reliable</strong></li>
  <li>Handle <strong>scale</strong> — millions or billions of rows</li>
</ul>
<h3>A day in the life</h3>
<p>A data engineer might spend a day: building a pipeline that pulls yesterday's orders, cleaning messy records, joining them with customer data, loading the result into a warehouse, and setting an alert if tomorrow's run fails. The goal is always the same — <strong>the right data, in the right place, at the right time, reliably</strong>.</p>

<h3>The four tools you'll master here</h3>
<p>Watch data flow through the whole modern stack — from a live event all the way to a dashboard:</p>
<svg class="svg-diagram" viewBox="0 0 520 150" role="img" aria-label="Animation of data flowing through Kafka, Spark, Snowflake to a dashboard">
  <g font-size="10" text-anchor="middle">
    <rect x="8" y="55" width="96" height="44" rx="8" fill="#2a2140" stroke="#b98bff"/><text x="56" y="76" fill="#b98bff" font-size="12">Kafka</text><text x="56" y="90" fill="#7c6aa8">stream</text>
    <rect x="145" y="55" width="96" height="44" rx="8" fill="#3a2f16" stroke="#f5b74e"/><text x="193" y="76" fill="#f5b74e" font-size="12">Spark</text><text x="193" y="90" fill="#a9832f">process</text>
    <rect x="282" y="55" width="96" height="44" rx="8" fill="#123a3f" stroke="#4ec9e0"/><text x="330" y="76" fill="#4ec9e0" font-size="12">Snowflake</text><text x="330" y="90" fill="#2b7f8f">store</text>
    <rect x="418" y="55" width="94" height="44" rx="8" fill="#12352a" stroke="#3ddc97"/><text x="465" y="76" fill="#3ddc97" font-size="12">Dashboard</text><text x="465" y="90" fill="#2b8f5f">insight</text>
  </g>
  <line x1="104" y1="77" x2="145" y2="77" stroke="#333c4d" stroke-width="2"/>
  <line x1="241" y1="77" x2="282" y2="77" stroke="#333c4d" stroke-width="2"/>
  <line x1="378" y1="77" x2="418" y2="77" stroke="#333c4d" stroke-width="2"/>
  <circle r="5" fill="#e7ebf2"><animateMotion dur="4s" repeatCount="indefinite" path="M56,77 H465"/></circle>
  <circle r="5" fill="#6c8cff"><animateMotion dur="4s" begin="-1.3s" repeatCount="indefinite" path="M56,77 H465"/></circle>
  <circle r="5" fill="#3ddc97"><animateMotion dur="4s" begin="-2.6s" repeatCount="indefinite" path="M56,77 H465"/></circle>
  <rect x="8" y="18" width="504" height="22" rx="6" fill="#13263f" stroke="#6c8cff" opacity="0.5"/>
  <text x="260" y="33" fill="#6c8cff" font-size="11" text-anchor="middle">🗓️ Airflow — schedules &amp; watches the whole flow</text>
</svg>

<h3>The modern data stack</h3>
<ul>
  <li><strong>Kafka</strong> — move real-time event streams (the conveyor belt)</li>
  <li><strong>Spark</strong> — process big data, batch &amp; streaming (the factory worker)</li>
  <li><strong>Snowflake</strong> — store &amp; query data at scale (the warehouse)</li>
  <li><strong>Airflow</strong> — orchestrate &amp; schedule everything (the manager)</li>
</ul>

<h3>Data engineer vs data analyst vs data scientist</h3>
<table class="tbl">
  <thead><tr><th>Role</th><th>Focus</th></tr></thead>
  <tbody>
    <tr><td><strong>Data engineer</strong></td><td>Builds the pipes &amp; storage that <em>deliver</em> data</td></tr>
    <tr><td>Data analyst</td><td>Queries data to answer business questions</td></tr>
    <tr><td>Data scientist</td><td>Builds models &amp; predictions on the data</td></tr>
  </tbody>
</table>

<h3>Why it's a great career</h3>
<p>Every company now runs on data, but that data is useless until someone makes it flow reliably. That's why data engineering is one of the most in-demand, well-paid roles in tech — and the four tools in this course are the exact ones employers ask for.</p>

<div class="callout"><strong>Recap:</strong> A data engineer builds the reliable "plumbing" for data. In this course you'll master the four tools that make up the modern stack — Kafka, Spark, Snowflake, and Airflow — and wire them together in real projects.</div>
`,
      },
      {
        id: "pipelines-batch-stream",
        title: "Pipelines: Batch vs Streaming",
        level: "easy",
        minutes: 8,
        body: `
<h2>Batch vs Streaming — the key idea</h2>
<p>Every data pipeline moves data in one of two rhythms. Understanding the difference is genuinely <strong>half of data engineering</strong> — almost every design decision flows from this one choice.</p>

<h3>Watch the difference</h3>
<p>In <strong>streaming</strong>, each event flows through the moment it arrives. In <strong>batch</strong>, events pile up and are processed together on a schedule. Watch:</p>
<svg class="svg-diagram" viewBox="0 0 520 210" role="img" aria-label="Animation comparing streaming and batch processing">
  <text x="10" y="20" fill="#3ddc97" font-size="13" font-weight="700">🌊 Streaming — process each event instantly</text>
  <line x1="20" y1="55" x2="470" y2="55" stroke="#262d3a" stroke-width="10" stroke-linecap="round"/>
  <rect x="470" y="38" width="42" height="34" rx="6" fill="#12352a" stroke="#3ddc97"/>
  <text x="491" y="59" fill="#3ddc97" font-size="10" text-anchor="middle">out</text>
  <circle r="6" fill="#3ddc97"><animateMotion dur="2.4s" repeatCount="indefinite" path="M20,55 H470"/></circle>
  <circle r="6" fill="#6c8cff"><animateMotion dur="2.4s" begin="-0.8s" repeatCount="indefinite" path="M20,55 H470"/></circle>
  <circle r="6" fill="#b98bff"><animateMotion dur="2.4s" begin="-1.6s" repeatCount="indefinite" path="M20,55 H470"/></circle>

  <text x="10" y="120" fill="#f5b74e" font-size="13" font-weight="700">🗂️ Batch — collect, then process on a schedule</text>
  <rect x="20" y="140" width="120" height="46" rx="8" fill="#1d222d" stroke="#333c4d"/>
  <text x="80" y="168" fill="#9aa4b5" font-size="11" text-anchor="middle">collecting…</text>
  <circle cx="60" cy="163" r="5" fill="#f5b74e"><animate attributeName="cy" values="150;163;150" dur="3s" repeatCount="indefinite"/></circle>
  <circle cx="80" cy="163" r="5" fill="#6c8cff"><animate attributeName="cy" values="150;163;150" dur="3s" begin="-1s" repeatCount="indefinite"/></circle>
  <circle cx="100" cy="163" r="5" fill="#b98bff"><animate attributeName="cy" values="150;163;150" dur="3s" begin="-2s" repeatCount="indefinite"/></circle>
  <line x1="140" y1="163" x2="380" y2="163" stroke="#262d3a" stroke-width="10" stroke-linecap="round"/>
  <rect x="380" y="146" width="120" height="34" rx="6" fill="#3a2f16" stroke="#f5b74e"/>
  <text x="440" y="167" fill="#f5b74e" font-size="10" text-anchor="middle">nightly run</text>
  <rect x="150" y="156" width="0" height="14" rx="3" fill="#f5b74e">
    <animate attributeName="width" values="0;220;220;0" keyTimes="0;0.4;0.85;1" dur="3s" repeatCount="indefinite"/>
  </rect>
</svg>

<h3>🗂️ Batch processing</h3>
<p>Collect data over a period, then process it <strong>all together in one big chunk</strong> on a schedule (say, every night at 2 AM).</p>
<ul>
  <li><strong>Example:</strong> "Calculate yesterday's total sales at midnight."</li>
  <li><strong>Latency:</strong> minutes to hours (you wait for the next run).</li>
  <li><strong>Strength:</strong> simple, cheap, easy to reprocess history.</li>
  <li><strong>Tools:</strong> Spark (process) + Airflow (schedule) + Snowflake (store).</li>
</ul>

<h3>🌊 Stream processing</h3>
<p>Process each event <strong>the instant it arrives</strong>, continuously, forever.</p>
<ul>
  <li><strong>Example:</strong> "Update a live sales dashboard as each order happens."</li>
  <li><strong>Latency:</strong> milliseconds to seconds.</li>
  <li><strong>Strength:</strong> real-time reactions (fraud alerts, live metrics).</li>
  <li><strong>Tools:</strong> Kafka (stream) + Spark Structured Streaming (process).</li>
</ul>

<h3>Side by side</h3>
<table class="tbl">
  <thead><tr><th></th><th>🗂️ Batch</th><th>🌊 Streaming</th></tr></thead>
  <tbody>
    <tr><td>When</td><td>On a schedule</td><td>Continuously</td></tr>
    <tr><td>Latency</td><td>Minutes–hours</td><td>Milliseconds–seconds</td></tr>
    <tr><td>Complexity</td><td>Lower</td><td>Higher</td></tr>
    <tr><td>Cost</td><td>Cheaper</td><td>Always-on</td></tr>
    <tr><td>Best for</td><td>Reports, ETL, ML training</td><td>Alerts, dashboards, monitoring</td></tr>
  </tbody>
</table>

<h3>Real-world examples</h3>
<ul>
  <li><strong>Batch:</strong> a bank computing daily interest overnight; a company's morning sales report.</li>
  <li><strong>Streaming:</strong> Uber matching riders live; a credit-card fraud check in the 200ms before a charge approves.</li>
</ul>

<div class="callout warn"><strong>Common mistake:</strong> reaching for streaming because it sounds impressive. Streaming is harder to build and operate. If "by tomorrow morning" is fine, batch is simpler, cheaper, and more reliable.</div>

<h3>The best of both: Lambda / Kappa</h3>
<p>Many real systems combine them — a fast streaming layer for "right now" numbers plus a batch layer that recomputes accurate history. That's the <strong>Lambda architecture</strong>. A <strong>Kappa</strong> architecture does everything as a stream and replays it when needed.</p>

<div class="callout tip"><strong>Recap:</strong> Batch = collect then process on a schedule (simple, cheap). Streaming = process each event instantly (real-time, complex). Ask "how fresh does this need to be?" — that answer picks your architecture.</div>
`,
      },
      {
        id: "how-flow-works",
        title: "How the tools work together",
        level: "medium",
        minutes: 9,
        body: `
<h2>How Kafka + Spark + Snowflake + Airflow fit</h2>
<p>Here's an end-to-end flow like the ones you'll build in the capstones:</p>
<div class="diagram">
  <div class="node" style="background:#2a2140;color:#b98bff">1. Kafka<br/><small>streams events</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">2. Spark<br/><small>cleans + aggregates</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#123a3f;color:#4ec9e0">3. Snowflake<br/><small>stores results</small></div>
</div>
<div class="diagram" style="border-style:solid;border-color:#3ddc97">
  <div class="node" style="background:#13263f;color:#6c8cff">Airflow orchestrates every step on a schedule &amp; retries on failure</div>
</div>
<ol>
  <li><strong>Kafka</strong> receives a constant stream of events (orders, clicks, sensors).</li>
  <li><strong>Spark</strong> reads, cleans, and computes results.</li>
  <li>Results land in <strong>Snowflake</strong> (the warehouse) for analysts to query.</li>
  <li><strong>Airflow</strong> schedules batch jobs, tracks success/failure, and retries.</li>
</ol>

<h3>Follow one order through the pipeline</h3>
<p>Imagine a customer buys a laptop. Here's what happens to that single event:</p>
<table class="tbl">
  <thead><tr><th>Stage</th><th>What happens to the order</th></tr></thead>
  <tbody>
    <tr><td>📡 Kafka</td><td><code>{"user":"u1","product":"Laptop","amount":1200}</code> is published to the <em>orders</em> topic</td></tr>
    <tr><td>⚡ Spark</td><td>reads it, validates it, adds it to the running total per product</td></tr>
    <tr><td>❄️ Snowflake</td><td>the updated <code>daily_revenue</code> row is stored: <code>Laptop → 1200</code></td></tr>
    <tr><td>🗓️ Airflow</td><td>made sure each step ran in order, on schedule, and retried if any failed</td></tr>
  </tbody>
</table>

<h3>Who owns what</h3>
<ul>
  <li><strong>Kafka</strong> = <em>movement</em> — get events from A to B, fast and durably.</li>
  <li><strong>Spark</strong> = <em>computation</em> — transform and aggregate at scale.</li>
  <li><strong>Snowflake</strong> = <em>storage &amp; querying</em> — the analyst-facing source of truth.</li>
  <li><strong>Airflow</strong> = <em>coordination</em> — the timing, ordering, and reliability of it all.</li>
</ul>

<h3>Batch or streaming — same players</h3>
<p>This exact cast works both ways. <strong>Streaming:</strong> Kafka → Spark Structured Streaming → Snowflake, updating continuously. <strong>Batch:</strong> Airflow triggers Spark nightly to read a file → load Snowflake. Same tools, different rhythm.</p>

<div class="callout tip"><strong>Recap:</strong> Kafka moves it, Spark shapes it, Snowflake stores it, Airflow runs the show. Keep this picture in mind — every capstone you build is a variation of it.</div>
`,
      },
      {
        id: "storage-warehouse-lake",
        title: "Warehouses, Lakes & Lakehouses",
        level: "medium",
        minutes: 9,
        body: `
<h2>Where does data live?</h2>
<h3>🏢 Data Warehouse</h3>
<p>A database optimized for <strong>analytics</strong> on <strong>structured</strong> (table) data. Fast SQL over huge tables. Examples: <strong>Snowflake</strong>, BigQuery, Redshift.</p>
<h3>🌊 Data Lake</h3>
<p>Cheap storage for <strong>raw</strong> data of <strong>any</strong> shape (files, JSON, images, logs). Examples: Amazon S3, ADLS, GCS.</p>
<h3>🏠 Lakehouse</h3>
<p>Best of both: lake-cheap storage + warehouse-style tables/queries. Examples: Databricks (Delta Lake), Apache Iceberg.</p>
<table class="tbl">
  <thead><tr><th></th><th>Warehouse</th><th>Lake</th></tr></thead>
  <tbody>
    <tr><td>Data type</td><td>Structured</td><td>Any (raw)</td></tr>
    <tr><td>Cost</td><td>Higher</td><td>Very low</td></tr>
    <tr><td>Query speed</td><td>Very fast SQL</td><td>Slower / needs engine</td></tr>
    <tr><td>Best for</td><td>BI &amp; dashboards</td><td>Cheap archive, ML, raw</td></tr>
  </tbody>
</table>
<h3>The medallion pattern (bronze → silver → gold)</h3>
<p>A popular way to organize data as it gets cleaner:</p>
<div class="diagram">
  <div class="node" style="background:#3a2f16;color:#cd7f32">🥉 Bronze<br/><small>raw</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#2a2d33;color:#c0c0c0">🥈 Silver<br/><small>cleaned</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#3a3416;color:#ffd700">🥇 Gold<br/><small>business-ready</small></div>
</div>
<ul>
  <li><strong>Bronze</strong> — raw data exactly as it arrived (keep it, it's cheap).</li>
  <li><strong>Silver</strong> — cleaned, de-duplicated, typed.</li>
  <li><strong>Gold</strong> — aggregated tables analysts and dashboards use.</li>
</ul>

<h3>Which should you use?</h3>
<ul>
  <li>Mostly SQL dashboards on structured data → <strong>warehouse</strong> (Snowflake).</li>
  <li>Tons of raw/varied data, ML, cheap archive → <strong>lake</strong> (S3).</li>
  <li>Want both without copying data twice → <strong>lakehouse</strong> (Delta/Iceberg).</li>
</ul>

<div class="callout">A common real-world pattern: land raw data in a <strong>lake</strong> → transform with <strong>Spark</strong> → load clean tables into a <strong>warehouse (Snowflake)</strong> for analysts.</div>
<div class="callout tip"><strong>Recap:</strong> Warehouse = fast SQL on structured data. Lake = cheap storage for anything. Lakehouse = both. Data usually flows raw → cleaned → business-ready (bronze → silver → gold).</div>
`,
      },
      {
        id: "etl-vs-elt",
        title: "ETL vs ELT & Data Modeling",
        level: "medium",
        minutes: 9,
        body: `
<h2>ETL vs ELT</h2>
<p>Both move data from sources to a warehouse — the difference is <em>when</em> you transform.</p>
<h3>ETL — Extract, Transform, Load</h3>
<p>Transform data <strong>before</strong> loading it. Classic approach (Spark transforms, then writes clean data).</p>
<div class="diagram"><div class="node" style="background:#13263f;color:#6c8cff">Extract</div><span class="arrow">→</span><div class="node" style="background:#3a2f16;color:#f5b74e">Transform</div><span class="arrow">→</span><div class="node" style="background:#123a3f;color:#4ec9e0">Load</div></div>
<h3>ELT — Extract, Load, Transform</h3>
<p>Load raw data first, then transform <strong>inside</strong> the warehouse using its power (modern, Snowflake-friendly). Tools like <strong>dbt</strong> do this.</p>
<div class="diagram"><div class="node" style="background:#13263f;color:#6c8cff">Extract</div><span class="arrow">→</span><div class="node" style="background:#123a3f;color:#4ec9e0">Load</div><span class="arrow">→</span><div class="node" style="background:#3a2f16;color:#f5b74e">Transform</div></div>
<h3>Data modeling: star schema</h3>
<p>Warehouses organize data into a <strong>fact table</strong> (events/measurements, e.g. sales) surrounded by <strong>dimension tables</strong> (context, e.g. customer, product, date). This "star schema" makes analytics fast and intuitive.</p>
<h3>A star schema example</h3>
<div class="diagram">
  <div class="node" style="background:#13263f;color:#6c8cff">dim_customer</div>
  <span class="arrow">＼</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">fact_sales<br/><small>amount, qty</small></div>
  <span class="arrow">／</span>
  <div class="node" style="background:#13263f;color:#6c8cff">dim_product</div>
</div>
<p>The central <code>fact_sales</code> holds the numbers (amount, quantity) plus keys pointing to dimension tables (<code>dim_customer</code>, <code>dim_product</code>, <code>dim_date</code>). Analysts join them to slice revenue by any dimension.</p>

<h3>Why ELT won in the cloud</h3>
<p>Old warehouses were slow, so you transformed data <em>before</em> loading (ETL). Modern warehouses like Snowflake are so powerful that it's now easier to load raw data and transform it <em>inside</em> the warehouse with SQL (ELT). Tools like <strong>dbt</strong> made ELT the default for analytics teams.</p>

<h3>Slowly Changing Dimensions (SCD)</h3>
<p>What happens when a customer moves city? A <strong>Type 1</strong> SCD overwrites the old value; a <strong>Type 2</strong> keeps history by adding a new row with valid-from/valid-to dates. This is how warehouses track change over time.</p>

<div class="callout tip"><strong>Fact</strong> = "what happened" (numbers you sum). <strong>Dimension</strong> = "the who/what/when/where" you group by.</div>
<div class="callout"><strong>Recap:</strong> ETL transforms before loading; ELT loads then transforms in the warehouse (modern default). Model data as facts + dimensions (star schema) so analytics stay fast and intuitive.</div>
`,
      },
      {
        id: "file-formats",
        title: "File Formats: CSV, JSON, Parquet, Avro",
        level: "medium",
        minutes: 8,
        body: `
<h2>File formats matter (a lot)</h2>
<p>Choosing the right format changes cost and speed dramatically.</p>
<h3>Row-based</h3>
<ul>
  <li><strong>CSV</strong> — simple, human-readable, no types, big. Fine for small data / exchange.</li>
  <li><strong>JSON</strong> — flexible nested data, verbose. Great for events/APIs (Kafka messages).</li>
  <li><strong>Avro</strong> — compact binary, stores schema, great for streaming/Kafka.</li>
</ul>
<h3>Columnar (the big-data favorites)</h3>
<ul>
  <li><strong>Parquet</strong> — columnar, compressed, typed. <strong>The default for Spark & lakes.</strong> Reading 2 of 50 columns only scans those 2 → huge speedups.</li>
  <li><strong>ORC</strong> — similar columnar format, common in the Hadoop/Hive world.</li>
</ul>
<h3>Row vs columnar — why it matters</h3>
<p>Row formats store one record at a time; columnar formats store one column at a time. If your query only needs 2 of 50 columns, columnar reads <em>only those two</em>:</p>
<svg class="svg-diagram" viewBox="0 0 520 130" role="img" aria-label="Diagram comparing row storage and columnar storage">
  <text x="10" y="18" fill="#9aa4b5" font-size="12">Row (CSV): reads whole rows</text>
  <g>
    <rect x="10" y="28" width="150" height="18" fill="#3a2f16" stroke="#5a4520"/>
    <rect x="10" y="48" width="150" height="18" fill="#3a2f16" stroke="#5a4520"/>
    <text x="170" y="41" fill="#6b7688" font-size="10">← scans everything</text>
  </g>
  <text x="10" y="90" fill="#9aa4b5" font-size="12">Columnar (Parquet): reads only needed columns</text>
  <g>
    <rect x="10" y="100" width="46" height="18" fill="#12352a" stroke="#3ddc97"/>
    <rect x="60" y="100" width="46" height="18" fill="#1d222d" stroke="#333c4d"/>
    <rect x="110" y="100" width="46" height="18" fill="#1d222d" stroke="#333c4d"/>
    <text x="170" y="113" fill="#3ddc97" font-size="10">← reads just 1 column</text>
  </g>
</svg>

<h3>Quick comparison</h3>
<table class="tbl">
  <thead><tr><th>Format</th><th>Type</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td>CSV</td><td>Row, text</td><td>Small data, human viewing, exchange</td></tr>
    <tr><td>JSON</td><td>Row, nested</td><td>Events, APIs, Kafka messages</td></tr>
    <tr><td>Avro</td><td>Row, binary</td><td>Streaming with schemas</td></tr>
    <tr><td>Parquet</td><td>Columnar</td><td>Analytics, lakes, Spark (the default)</td></tr>
  </tbody>
</table>

<h3>Bonus: compression</h3>
<p>Because a column holds similar values, columnar formats compress extremely well — often <strong>5–10× smaller</strong> than CSV. Smaller files = less to read = faster and cheaper.</p>

<div class="callout warn"><strong>Rule:</strong> exchange &amp; events → CSV/JSON/Avro. Analytics &amp; storage at scale → <strong>Parquet</strong>. Columnar formats are why Spark + warehouses are so fast.</div>
<div class="callout tip"><strong>Recap:</strong> Row formats (CSV/JSON/Avro) suit exchange and streaming; columnar Parquet suits analytics — it reads only needed columns and compresses hard. Default to Parquet for storage at scale.</div>
`,
      },
      {
        id: "data-quality",
        title: "Data Quality & Testing",
        level: "medium",
        minutes: 9,
        body: `
<h2>Data Quality — the silent job</h2>
<p>A pipeline that runs perfectly but delivers <em>wrong</em> data is worse than one that crashes — because nobody notices until a bad decision is made. Guarding data quality is a core part of the job.</p>
<h3>The six dimensions of data quality</h3>
<table class="tbl">
  <thead><tr><th>Dimension</th><th>Question it answers</th></tr></thead>
  <tbody>
    <tr><td>Completeness</td><td>Are required fields present (no nulls)?</td></tr>
    <tr><td>Uniqueness</td><td>Are there duplicate rows?</td></tr>
    <tr><td>Validity</td><td>Do values match the expected format/range?</td></tr>
    <tr><td>Accuracy</td><td>Do values reflect reality?</td></tr>
    <tr><td>Consistency</td><td>Do related values agree across tables?</td></tr>
    <tr><td>Timeliness</td><td>Is the data fresh enough?</td></tr>
  </tbody>
</table>
<h3>Where you check</h3>
<ul>
  <li><strong>On ingest</strong> — reject or quarantine bad records early.</li>
  <li><strong>In transformations</strong> — assert row counts, null rates, key uniqueness.</li>
  <li><strong>After load</strong> — reconcile totals against the source.</li>
</ul>
<h3>Tools you'll hear about</h3>
<ul>
  <li><strong>Great Expectations</strong> / <strong>dbt tests</strong> — declarative data tests.</li>
  <li><strong>Airflow</strong> — a "quality_check" task that fails the DAG if data looks wrong.</li>
</ul>
<div class="callout warn"><strong>Fail loudly:</strong> a good pipeline stops and alerts when data is bad, rather than quietly loading garbage into the warehouse.</div>
<div class="callout tip"><strong>Recap:</strong> Data quality = completeness, uniqueness, validity, accuracy, consistency, timeliness. Test at ingest, during transforms, and after load — and make failures loud.</div>
`,
      },
      {
        id: "de-workflow",
        title: "How data engineers actually work (day-to-day)",
        level: "medium",
        minutes: 10,
        body: `
<h2>The real working style</h2>
<p>Beyond the tools, this is how the job actually flows — the habits and setup used every day.</p>
<h3>A typical day</h3>
<ol>
  <li>Check overnight pipeline runs (Airflow UI) — anything red?</li>
  <li>Fix/backfill any failures; answer "why is this number wrong?" questions.</li>
  <li>Build a new pipeline or transformation on a <strong>branch</strong>.</li>
  <li>Test locally, open a <strong>pull request</strong>, get review, merge → CI/CD deploys it.</li>
  <li>Monitor the new pipeline's first production runs.</li>
</ol>
<h3>The everyday toolbox</h3>
<ul>
  <li><strong>Git</strong> — all pipelines/DAGs live in version control. You branch, commit, PR.</li>
  <li><strong>Docker</strong> — run Airflow/Spark/Kafka locally the same way as prod.</li>
  <li><strong>CI/CD</strong> (GitHub Actions, GitLab CI) — tests run on every PR; merge auto-deploys DAGs.</li>
  <li><strong>Notebooks</strong> (Jupyter) — explore data before writing the real job.</li>
  <li><strong>The terminal</strong> — you live in it: <code>git</code>, <code>docker</code>, <code>airflow</code>, <code>spark-submit</code>, SQL clients.</li>
</ul>
<h3>Local → production</h3>
<div class="diagram">
  <div class="node" style="background:#13263f;color:#6c8cff">Explore<br/><small>notebook</small></div><span class="arrow">→</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">Build<br/><small>code + tests</small></div><span class="arrow">→</span>
  <div class="node" style="background:#2a2140;color:#b98bff">PR + review</div><span class="arrow">→</span>
  <div class="node" style="background:#12352a;color:#3ddc97">Deploy<br/><small>CI/CD</small></div>
</div>
<div class="callout warn"><strong>Golden habit:</strong> never hand-edit data or run scripts straight on prod. Everything goes through code + git + review, so it's repeatable and reviewable.</div>
<div class="callout tip"><strong>Recap:</strong> The working style is engineering discipline applied to data — version control, containers, tests, CI/CD, and monitoring. The tools change; these habits don't.</div>
`,
      },
    ],
  },

  /* ============================== AIRFLOW ============================== */
  {
    id: "airflow",
    title: "Apache Airflow",
    icon: "🗓️",
    tagline: "The orchestrator",
    summary:
      "Everything about orchestration: DAGs, operators, scheduling, retries, sensors, XComs, hooks, connections & production best practices.",
    lessons: [
      {
        id: "airflow-intro",
        title: "What is Airflow & what is a DAG?",
        level: "easy",
        minutes: 8,
        body: `
<h2>Apache Airflow — the orchestrator</h2>
<p><strong>Airflow</strong> schedules and monitors data pipelines. You describe a pipeline as code, and Airflow runs it on time, in the right order, and retries automatically on failure.</p>

<h3>What is a DAG?</h3>
<p>A <strong>DAG</strong> (Directed Acyclic Graph) is your pipeline drawn as a flow of <strong>tasks</strong> with <strong>dependencies</strong> — and it never loops back on itself. Watch a DAG run, task by task:</p>
<svg class="svg-diagram" viewBox="0 0 520 110" role="img" aria-label="Animation of an Airflow DAG running tasks in sequence">
  <line x1="120" y1="55" x2="210" y2="55" stroke="#333c4d" stroke-width="2"/>
  <line x1="310" y1="55" x2="400" y2="55" stroke="#333c4d" stroke-width="2"/>

  <g font-size="12" text-anchor="middle">
    <rect x="20" y="35" width="100" height="40" rx="8" stroke="#3ddc97" fill="#13263f">
      <animate attributeName="fill" values="#13263f;#12352a;#12352a;#13263f" keyTimes="0;0.15;0.9;1" dur="4.5s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <text x="70" y="59" fill="#e7ebf2">extract</text>

    <rect x="210" y="35" width="100" height="40" rx="8" stroke="#333c4d" fill="#13263f">
      <animate attributeName="fill" values="#13263f;#13263f;#12352a;#12352a;#13263f" keyTimes="0;0.3;0.4;0.9;1" dur="4.5s" begin="0s" repeatCount="indefinite"/>
      <animate attributeName="stroke" values="#333c4d;#333c4d;#3ddc97;#3ddc97;#333c4d" keyTimes="0;0.3;0.4;0.9;1" dur="4.5s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <text x="260" y="59" fill="#e7ebf2">transform</text>

    <rect x="400" y="35" width="100" height="40" rx="8" stroke="#333c4d" fill="#13263f">
      <animate attributeName="fill" values="#13263f;#13263f;#12352a;#12352a;#13263f" keyTimes="0;0.55;0.65;0.9;1" dur="4.5s" begin="0s" repeatCount="indefinite"/>
      <animate attributeName="stroke" values="#333c4d;#333c4d;#3ddc97;#3ddc97;#333c4d" keyTimes="0;0.55;0.65;0.9;1" dur="4.5s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <text x="450" y="59" fill="#e7ebf2">load</text>
  </g>
</svg>

<h3>Core vocabulary</h3>
<ul>
  <li><strong>Task</strong> — one unit of work</li>
  <li><strong>Operator</strong> — the <em>type</em> of a task (PythonOperator, BashOperator…)</li>
  <li><strong>Dependency</strong> — <code>a &gt;&gt; b</code> means "run a, then b"</li>
  <li><strong>DAG Run</strong> — one execution of the whole DAG for a date</li>
  <li><strong>Scheduler</strong> — the component that triggers DAGs on time</li>
  <li><strong>Executor</strong> — how/where tasks actually run (Local, Celery, Kubernetes)</li>
</ul>

<h3>Why not just a cron job?</h3>
<p>You <em>could</em> schedule scripts with cron — but Airflow adds what cron can't: <strong>dependencies</strong> (run B only after A succeeds), <strong>retries</strong>, <strong>monitoring &amp; alerts</strong>, <strong>backfills</strong>, and a <strong>UI</strong> to see exactly what ran and what failed.</p>

<div class="callout tip"><strong>Mental model:</strong> Airflow is the <em>conductor</em> of your data orchestra — it tells Spark and Snowflake when to play, in what order, and restarts anyone who misses a note.</div>
<div class="callout"><strong>Recap:</strong> A DAG is tasks + dependencies as code. The Scheduler runs them on time; the Executor runs the work; the UI shows you everything.</div>
`,
      },
      {
        id: "airflow-architecture",
        title: "Airflow architecture & components",
        level: "medium",
        minutes: 8,
        body: `
<h2>How Airflow is built</h2>
<p>Airflow has a few cooperating parts:</p>
<ul>
  <li><strong>Scheduler</strong> — reads your DAGs, decides what should run now, queues tasks.</li>
  <li><strong>Executor</strong> — runs the queued tasks. Types: <em>LocalExecutor</em> (one machine), <em>CeleryExecutor</em> (worker pool), <em>KubernetesExecutor</em> (a pod per task).</li>
  <li><strong>Workers</strong> — the processes that actually execute task code.</li>
  <li><strong>Metadata database</strong> — stores DAG runs, task states, connections, variables (Postgres/MySQL).</li>
  <li><strong>Webserver (UI)</strong> — the graph/grid views to watch and trigger runs.</li>
</ul>
<h3>How the parts talk to each other</h3>
<svg class="svg-diagram" viewBox="0 0 520 180" role="img" aria-label="Animation of Airflow components: DAG files, scheduler, workers, metadata DB, and UI">
  <g font-size="10" text-anchor="middle">
    <rect x="8" y="70" width="86" height="40" rx="7" fill="#1d222d" stroke="#333c4d"/><text x="51" y="88" fill="#e7ebf2">DAG files</text><text x="51" y="102" fill="#6b7688">.py</text>
    <rect x="135" y="70" width="90" height="40" rx="7" fill="#13263f" stroke="#6c8cff"/><text x="180" y="88" fill="#6c8cff">Scheduler</text><text x="180" y="102" fill="#4a6291">what runs now</text>
    <rect x="266" y="70" width="100" height="40" rx="7" fill="#3a2f16" stroke="#f5b74e"/><text x="316" y="88" fill="#f5b74e">Executor</text><text x="316" y="102" fill="#a9832f">+ workers</text>
    <rect x="408" y="30" width="104" height="36" rx="7" fill="#12352a" stroke="#3ddc97"/><text x="460" y="52" fill="#3ddc97">Metadata DB</text>
    <rect x="408" y="112" width="104" height="36" rx="7" fill="#2a2140" stroke="#b98bff"/><text x="460" y="134" fill="#b98bff">Web UI</text>
  </g>
  <line x1="94" y1="90" x2="135" y2="90" stroke="#333c4d" stroke-width="2"/>
  <line x1="225" y1="90" x2="266" y2="90" stroke="#333c4d" stroke-width="2"/>
  <line x1="366" y1="82" x2="408" y2="55" stroke="#333c4d" stroke-width="2"/>
  <line x1="366" y1="98" x2="408" y2="125" stroke="#333c4d" stroke-width="2"/>
  <circle r="5" fill="#e7ebf2"><animateMotion dur="3s" repeatCount="indefinite" path="M51,90 H180 H316 L460,48"/></circle>
  <circle r="5" fill="#3ddc97"><animateMotion dur="3s" begin="-1.5s" repeatCount="indefinite" path="M316,90 L460,130"/></circle>
</svg>

<h3>How a single task actually runs</h3>
<ol>
  <li>Scheduler parses DAG files and finds a task whose dependencies are met.</li>
  <li>It queues the task and records "queued" in the metadata DB.</li>
  <li>The Executor picks it up and a Worker runs the task's code.</li>
  <li>The Worker writes "success" (or "failed") back to the metadata DB.</li>
  <li>The Web UI reads that state so you see it live.</li>
</ol>

<h3>Choosing an executor</h3>
<table class="tbl">
  <thead><tr><th>Executor</th><th>Runs tasks…</th><th>Use when</th></tr></thead>
  <tbody>
    <tr><td>Local</td><td>on one machine</td><td>dev, small workloads</td></tr>
    <tr><td>Celery</td><td>on a pool of workers</td><td>scale across machines</td></tr>
    <tr><td>Kubernetes</td><td>one pod per task</td><td>elastic, isolated at scale</td></tr>
  </tbody>
</table>

<div class="callout tip"><strong>Recap:</strong> You write DAG files → the Scheduler decides what runs → the Executor + Workers run it → state is saved in the metadata DB → the Web UI shows it. The executor choice is how you scale.</div>
`,
      },
      {
        id: "airflow-first-dag",
        title: "Write your first DAG",
        level: "medium",
        minutes: 12,
        body: `
<h2>Your first DAG</h2>
<p>A DAG is just a Python file. Define tasks and connect them with <code>>></code>.</p>
<div class="codeblock">from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract(): print("extracting data")
def transform(): print("transforming data")
def load(): print("loading data")

with DAG("my_pipeline", start_date=datetime(2024,1,1),
         schedule="@daily", catchup=False) as dag:
    a = PythonOperator(task_id="extract", python_callable=extract)
    b = PythonOperator(task_id="transform", python_callable=transform)
    c = PythonOperator(task_id="load", python_callable=load)
    a >> b >> c   # run order</div>
<div class="callout"><strong>The magic line</strong> is <code>a >> b >> c</code>. Change it to <code>a >> [b, c]</code> to run b and c in parallel after a.</div>

<h3>Anatomy of the file</h3>
<ul>
  <li><strong><code>with DAG(...)</code></strong> — defines the pipeline: its id, start date, and schedule.</li>
  <li><strong><code>start_date</code></strong> — the first date it's eligible to run.</li>
  <li><strong><code>schedule="@daily"</code></strong> — how often it runs.</li>
  <li><strong><code>catchup=False</code></strong> — don't back-run every missed date (important!).</li>
  <li><strong>Each operator</strong> — one task with a unique <code>task_id</code>.</li>
</ul>

<h3>Dependency patterns</h3>
<table class="tbl">
  <thead><tr><th>Pattern</th><th>Code</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>Chain</td><td><code>a &gt;&gt; b &gt;&gt; c</code></td><td>one after another</td></tr>
    <tr><td>Fan-out</td><td><code>a &gt;&gt; [b, c]</code></td><td>b and c after a, in parallel</td></tr>
    <tr><td>Fan-in</td><td><code>[a, b] &gt;&gt; c</code></td><td>c waits for both a and b</td></tr>
  </tbody>
</table>

<div class="callout warn"><strong>Gotcha:</strong> everything at the top level of a DAG file runs <em>every time the scheduler parses it</em> (often every few seconds). Keep slow code and API calls <em>inside</em> task functions, never at the top level.</div>

<p>Try it below — edit the tasks and dependencies and press <strong>Run</strong> to watch the DAG execute task by task.</p>
`,
        practice: {
          type: "dag",
          title: "Run a DAG",
          instructions:
            "Define tasks and connect them with edges. Press Run to watch each task turn green in order. Try 'a >> [b, c]' style by adding two edges from one task.",
          starter: `# Define your tasks (task_id names) and dependencies.
tasks = ["extract", "transform", "validate", "load"]

# Dependencies: [from, to] pairs
edges = [
    ["extract", "transform"],
    ["transform", "validate"],
    ["validate", "load"],
]`,
        },
      },
      {
        id: "airflow-operators",
        title: "Operators, tasks & the TaskFlow API",
        level: "medium",
        minutes: 10,
        body: `
<h2>Operators = the building blocks</h2>
<p>An <strong>operator</strong> defines what a task does. Common ones:</p>
<ul>
  <li><strong>PythonOperator</strong> — run a Python function</li>
  <li><strong>BashOperator</strong> — run a shell command</li>
  <li><strong>EmailOperator</strong> — send an email</li>
  <li><strong>Providers</strong> — <code>SparkSubmitOperator</code>, <code>SnowflakeOperator</code>, <code>S3ToSnowflakeOperator</code>, etc.</li>
</ul>
<h3>The modern TaskFlow API</h3>
<p>Newer Airflow lets you write tasks as decorated functions — cleaner, and return values pass automatically:</p>
<div class="codeblock">from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule="@daily", start_date=datetime(2024,1,1), catchup=False)
def etl():
    @task
    def extract(): return [1, 2, 3]
    @task
    def transform(rows): return [r * 10 for r in rows]
    @task
    def load(rows): print("loaded", rows)
    load(transform(extract()))

etl()</div>
<div class="callout tip">TaskFlow figures out the dependencies from how you call the functions — no <code>>></code> needed.</div>
<h3>Provider operators (the real power)</h3>
<p>Airflow's ecosystem has thousands of ready-made operators so you rarely write integration code by hand:</p>
<ul>
  <li><code>SparkSubmitOperator</code> — submit a Spark job</li>
  <li><code>SnowflakeOperator</code> — run SQL in Snowflake</li>
  <li><code>S3ToSnowflakeOperator</code> — load files into Snowflake</li>
  <li><code>SimpleHttpOperator</code> — call an API</li>
</ul>
<div class="callout"><strong>Recap:</strong> Operators are the building blocks — one per task. Use classic operators or the cleaner TaskFlow <code>@task</code> API, and lean on provider operators to talk to Spark, Snowflake, S3, and more.</div>
`,
      },
      {
        id: "airflow-scheduling",
        title: "Scheduling, cron & backfills",
        level: "medium",
        minutes: 10,
        body: `
<h2>When does a DAG run?</h2>
<p>The <code>schedule</code> argument controls timing:</p>
<ul>
  <li><code>"@daily"</code>, <code>"@hourly"</code>, <code>"@weekly"</code> — presets</li>
  <li><code>"0 6 * * *"</code> — cron (here: every day at 06:00)</li>
  <li><code>None</code> — manual trigger only</li>
</ul>
<h3>Cron in 30 seconds</h3>
<div class="codeblock">┌── minute (0-59)
│ ┌── hour (0-23)
│ │ ┌── day of month (1-31)
│ │ │ ┌── month (1-12)
│ │ │ │ ┌── day of week (0-6, Sun=0)
│ │ │ │ │
0 6 * * *   → every day at 06:00</div>
<h3>catchup & backfill</h3>
<p><strong>catchup=True</strong> means if your DAG's start_date is in the past, Airflow runs one DAG Run for <em>every</em> missed interval to "catch up". Set <code>catchup=False</code> unless you truly want history reprocessed.</p>
<p><strong>Backfill</strong> = deliberately re-running past intervals (e.g. after fixing a bug).</p>
<div class="callout warn">A very common beginner surprise: turning on a DAG with an old start_date and catchup=True triggers hundreds of runs at once. Use <code>catchup=False</code>.</div>
<h3>Common cron patterns</h3>
<table class="tbl">
  <thead><tr><th>Cron</th><th>Runs</th></tr></thead>
  <tbody>
    <tr><td><code>0 * * * *</code></td><td>every hour</td></tr>
    <tr><td><code>0 6 * * *</code></td><td>daily at 06:00</td></tr>
    <tr><td><code>0 6 * * 1</code></td><td>Mondays at 06:00</td></tr>
    <tr><td><code>*/15 * * * *</code></td><td>every 15 minutes</td></tr>
  </tbody>
</table>
<div class="callout tip"><strong>Recap:</strong> The schedule + start_date decide when a DAG runs. Cron gives precise control; <code>catchup</code> decides whether missed intervals get back-run. Default to <code>catchup=False</code>.</div>
`,
      },
      {
        id: "airflow-retries-sensors",
        title: "Retries, sensors & branching",
        level: "advanced",
        minutes: 11,
        body: `
<h2>Making DAGs production-ready</h2>
<h3>🔁 Retries</h3>
<p>Real pipelines fail (network blips, late files). Airflow retries automatically:</p>
<div class="codeblock">from datetime import timedelta
PythonOperator(
    task_id="load", python_callable=load,
    retries=3, retry_delay=timedelta(minutes=5),
)</div>
<h3>👀 Sensors</h3>
<p>A <strong>sensor</strong> waits for a condition before continuing — a file arriving, a partition landing, a time passing. Use <code>mode="reschedule"</code> so it frees the worker while waiting.</p>
<div class="codeblock">from airflow.sensors.filesystem import FileSensor
wait = FileSensor(task_id="wait_for_file",
                  filepath="/data/sales.csv", mode="reschedule")</div>
<h3>🔀 Branching</h3>
<p><code>BranchPythonOperator</code> chooses a path at runtime — e.g. "if no new data, skip processing".</p>
<div class="callout warn"><strong>Idempotency:</strong> design tasks so running one twice gives the same result. This makes retries and backfills safe.</div>
<h3>Making a task idempotent</h3>
<ul>
  <li><strong>Bad:</strong> <code>INSERT</code> new rows every run → duplicates on retry.</li>
  <li><strong>Good:</strong> <code>DELETE</code> today's partition then insert, or use <code>MERGE</code>/upsert → same result no matter how many times it runs.</li>
</ul>
<div class="callout tip"><strong>Recap:</strong> Production DAGs survive the real world with <strong>retries</strong> (auto-recover), <strong>sensors</strong> (wait for readiness), <strong>branching</strong> (conditional paths), and <strong>idempotency</strong> (safe to re-run).</div>
`,
      },
      {
        id: "airflow-xcom-hooks",
        title: "XComs, Hooks, Connections & Variables",
        level: "advanced",
        minutes: 10,
        body: `
<h2>Passing data & talking to the outside world</h2>
<h3>📨 XComs (cross-communication)</h3>
<p>Tasks pass <em>small</em> values via XComs — e.g. task A computes a row count, task B reads it. (For big data, pass a <em>path/pointer</em>, not the data itself.)</p>
<div class="codeblock">def count(**ctx):
    ctx["ti"].xcom_push(key="rows", value=1000)
def report(**ctx):
    n = ctx["ti"].xcom_pull(key="rows")
    print("rows:", n)</div>
<h3>🔌 Connections & Hooks</h3>
<p><strong>Connections</strong> store credentials (to Snowflake, S3, a DB) securely in Airflow. <strong>Hooks</strong> are the code that uses a connection to talk to that system — e.g. <code>SnowflakeHook</code>.</p>
<h3>🔧 Variables</h3>
<p><strong>Variables</strong> are key/value config (e.g. an S3 bucket name) you can change without editing code: <code>Variable.get("bucket")</code>.</p>
<div class="callout tip">Never hard-code passwords in a DAG. Use Connections + Hooks; use Variables for config.</div>
<div class="callout warn"><strong>XCom size limit:</strong> XComs are stored in the metadata DB, so they're for <em>small</em> values (IDs, counts, file paths) — never large datasets. Pass a <em>pointer</em> (an S3 path), not the data.</div>
<div class="callout"><strong>Recap:</strong> XComs pass small values between tasks; Connections + Hooks talk securely to external systems; Variables hold config. Together they keep secrets and settings out of your code.</div>
`,
      },
      {
        id: "airflow-best-practices",
        title: "Production best practices",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Airflow in production</h2>
<ul>
  <li><strong>Keep DAG files light</strong> — no heavy computation at the top level; the scheduler parses them constantly.</li>
  <li><strong>Idempotent tasks</strong> — safe to retry and backfill.</li>
  <li><strong>Use the right executor</strong> — Local for small, Celery/Kubernetes for scale.</li>
  <li><strong>Alerting</strong> — <code>on_failure_callback</code>, email/Slack on failure, and SLAs.</li>
  <li><strong>Don't process big data <em>inside</em> Airflow</strong> — Airflow <em>orchestrates</em>; let Spark/Snowflake do the heavy lifting (submit a job, wait, continue).</li>
  <li><strong>Version your DAGs</strong> in git; deploy via CI/CD.</li>
</ul>
<h3>Production checklist</h3>
<ul>
  <li>✅ <code>catchup=False</code> unless you truly want backfills</li>
  <li>✅ retries + alerts on every important task</li>
  <li>✅ idempotent tasks (safe to re-run)</li>
  <li>✅ secrets in Connections, config in Variables</li>
  <li>✅ heavy work delegated to Spark/Snowflake, not run in Airflow</li>
  <li>✅ DAGs in git, deployed via CI/CD</li>
</ul>
<div class="callout"><strong>Mental model:</strong> Airflow is the <em>conductor</em>, not the orchestra. It tells Spark and Snowflake when to play — it doesn't play the instruments itself.</div>
<div class="callout tip"><strong>Recap:</strong> Keep DAG files light, tasks idempotent, secrets secure, and let the specialist engines do the heavy lifting. Airflow's job is reliable coordination.</div>
`,
      },
      {
        id: "airflow-dynamic",
        title: "Dynamic DAGs & Task Groups",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Scaling DAGs without copy-paste</h2>
<h3>🔁 Dynamic task mapping</h3>
<p>Sometimes you don't know how many tasks you need until runtime — e.g. "process each file that landed today." Airflow's <code>.expand()</code> creates a task per item at runtime:</p>
<div class="codeblock">@task
def process(file): ...

files = list_files()          # returns e.g. 12 files
process.expand(file=files)    # → 12 parallel mapped tasks</div>
<h3>🗂️ Task Groups</h3>
<p>Group related tasks so a big DAG stays readable in the UI (they collapse into one box):</p>
<div class="codeblock">from airflow.utils.task_group import TaskGroup
with TaskGroup("ingest") as ingest:
    a >> b >> c</div>
<h3>Generating DAGs from config</h3>
<p>Teams often generate many similar DAGs from a config file or database (one per data source) instead of writing each by hand — the "DAG factory" pattern.</p>
<div class="callout warn"><strong>Keep it light:</strong> DAG generation code runs on every scheduler parse. Read config quickly; don't hit slow APIs at parse time.</div>
<div class="callout tip"><strong>Recap:</strong> Use dynamic task mapping (<code>.expand()</code>) for runtime-sized workloads, Task Groups to keep big DAGs readable, and DAG factories to generate many similar pipelines from config.</div>
`,
      },
      {
        id: "airflow-running",
        title: "Running Airflow: setup, CLI & the UI (working style)",
        level: "medium",
        minutes: 11,
        body: `
<h2>Actually running Airflow</h2>
<h3>1. Get it running (fastest ways)</h3>
<div class="codeblock"># Quick single-machine dev:
pip install apache-airflow
airflow standalone      # starts scheduler + webserver + a login

# Realistic (like production): Docker Compose
curl -LfO 'https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml'
docker compose up</div>
<p>Drop your DAG <code>.py</code> files into the <code>dags/</code> folder — the scheduler auto-detects them.</p>
<h3>2. The CLI you'll use daily</h3>
<div class="codeblock">airflow dags list                 # all DAGs
airflow dags test my_pipeline 2024-01-01   # run a DAG once, locally, no scheduler
airflow tasks test my_pipeline extract 2024-01-01  # run ONE task
airflow dags trigger my_pipeline  # kick off a run now
airflow dags backfill -s 2024-01-01 -e 2024-01-07 my_pipeline</div>
<div class="callout tip"><code>airflow dags test</code> is your best friend — it runs the whole DAG in your terminal so you can debug before deploying.</div>
<h3>3. Reading the UI</h3>
<ul>
  <li><strong>Grid view</strong> — every run × task as coloured squares (green=success, red=failed, yellow=running).</li>
  <li>Click a red square → <strong>Logs</strong> to see the traceback.</li>
  <li><strong>Graph view</strong> — the DAG's task dependencies.</li>
  <li>Use <strong>Clear</strong> to re-run a failed task after a fix.</li>
</ul>
<h3>4. Debugging failures</h3>
<ol>
  <li>Grid view → find the red task → open Logs.</li>
  <li>Read the traceback (usually a missing connection, bad SQL, or timeout).</li>
  <li>Fix the code → push → Clear the task to retry.</li>
</ol>
<div class="callout"><strong>Recap:</strong> <code>airflow standalone</code> or Docker to run it; <code>dags test</code>/<code>tasks test</code> to debug locally; the Grid view + Logs to monitor and fix in production.</div>
`,
      },
    ],
  },

  /* =============================== SPARK ============================== */
  {
    id: "spark",
    title: "Apache Spark",
    icon: "⚡",
    tagline: "The processor",
    summary:
      "From RDDs & DataFrames to transformations, SQL, joins, window functions, architecture, performance tuning & streaming — with real Python you run live.",
    lessons: [
      {
        id: "spark-intro",
        title: "Why Spark? RDDs & DataFrames",
        level: "easy",
        minutes: 8,
        body: `
<h2>Apache Spark — the processor</h2>
<p><strong>Spark</strong> processes huge amounts of data <strong>fast</strong> by splitting the work across many machines (distributed computing) and keeping data in memory instead of on disk.</p>

<h3>The core trick: split &amp; conquer</h3>
<p>One giant dataset is split into <strong>partitions</strong> that many <strong>executors</strong> crunch <em>at the same time</em>. Watch the data fan out to workers and come back combined:</p>
<svg class="svg-diagram" viewBox="0 0 520 200" role="img" aria-label="Animation of Spark splitting data across parallel executors">
  <rect x="12" y="82" width="90" height="40" rx="8" fill="#3a2f16" stroke="#f5b74e"/>
  <text x="57" y="100" fill="#f5b74e" font-size="11" text-anchor="middle">Big data</text>
  <text x="57" y="114" fill="#a9832f" font-size="9" text-anchor="middle">500 GB</text>

  <g fill="#171b24" stroke="#333c4d">
    <rect x="220" y="18" width="110" height="32" rx="6"/>
    <rect x="220" y="70" width="110" height="32" rx="6"/>
    <rect x="220" y="122" width="110" height="32" rx="6"/>
    <rect x="220" y="164" width="110" height="28" rx="6"/>
  </g>
  <g fill="#6c8cff" font-size="10" text-anchor="middle">
    <text x="275" y="38">executor 1</text><text x="275" y="90">executor 2</text>
    <text x="275" y="142">executor 3</text><text x="275" y="182">executor 4</text>
  </g>

  <rect x="410" y="82" width="96" height="40" rx="8" fill="#12352a" stroke="#3ddc97"/>
  <text x="458" y="106" fill="#3ddc97" font-size="11" text-anchor="middle">Result</text>

  <circle r="5" fill="#f5b74e"><animateMotion dur="2.2s" repeatCount="indefinite" path="M102,102 L220,34 M330,34 L410,102"/></circle>
  <circle r="5" fill="#f5b74e"><animateMotion dur="2.2s" begin="-0.3s" repeatCount="indefinite" path="M102,102 L220,86 M330,86 L410,102"/></circle>
  <circle r="5" fill="#f5b74e"><animateMotion dur="2.2s" begin="-0.6s" repeatCount="indefinite" path="M102,102 L220,138 M330,138 L410,102"/></circle>
  <circle r="5" fill="#f5b74e"><animateMotion dur="2.2s" begin="-0.9s" repeatCount="indefinite" path="M102,102 L220,178 M330,178 L410,102"/></circle>
</svg>

<h3>Why not just pandas?</h3>
<p>pandas loads everything into <strong>one</strong> machine's memory. If your data is 500 GB, that won't fit. Spark splits the data into pieces and processes them <strong>in parallel</strong> across a cluster — so it scales from your laptop to thousands of machines with the same code.</p>

<h3>Spark's data structures</h3>
<ul>
  <li><strong>RDD</strong> — the low-level "resilient distributed dataset" (rarely used directly now)</li>
  <li><strong>DataFrame</strong> — a distributed table with rows &amp; columns. What you'll use 95% of the time.</li>
  <li><strong>Dataset</strong> — typed DataFrames (Scala/Java)</li>
</ul>

<h3>What Spark can do</h3>
<ul>
  <li><strong>Batch</strong> — massive ETL and aggregations</li>
  <li><strong>Streaming</strong> — real-time processing (Structured Streaming)</li>
  <li><strong>SQL</strong> — query data with Spark SQL</li>
  <li><strong>MLlib</strong> — machine learning at scale</li>
</ul>

<div class="callout tip">You write simple-looking DataFrame code; Spark's engine (Catalyst) figures out how to run it across the whole cluster efficiently — you get parallelism almost for free.</div>
<div class="callout"><strong>Recap:</strong> Spark = split data into partitions → process in parallel across executors → combine. In-memory + distributed = fast at any scale.</div>
`,
      },
      {
        id: "spark-transforms",
        title: "Transformations vs Actions (lazy eval)",
        level: "medium",
        minutes: 12,
        body: `
<h2>Transformations vs Actions</h2>
<p>This is <strong>the</strong> core Spark concept.</p>
<ul>
  <li><strong>Transformation</strong> = a recipe step (<code>filter</code>, <code>select</code>, <code>groupBy</code>). Spark just <em>remembers</em> it — nothing runs yet. This is "lazy".</li>
  <li><strong>Action</strong> = "cook it now" (<code>show</code>, <code>count</code>, <code>collect</code>, <code>write</code>). This triggers the remembered steps to run.</li>
</ul>
<div class="callout"><strong>Why lazy?</strong> By waiting for an action, Spark optimizes the whole plan first — skipping wasted work.</div>
<h3>Watch lazy evaluation</h3>
<p>Transformations just <em>stack up</em> as a plan (nothing runs). The moment an <strong>action</strong> fires, Spark runs the whole plan at once:</p>
<svg class="svg-diagram" viewBox="0 0 520 150" role="img" aria-label="Animation of Spark lazy evaluation: transformations queue, then an action triggers execution">
  <g font-size="11" text-anchor="middle">
    <rect x="30" y="20" width="150" height="26" rx="6" fill="#1d222d" stroke="#333c4d"><animate attributeName="stroke" values="#333c4d;#333c4d;#3ddc97;#3ddc97;#333c4d" keyTimes="0;0.55;0.62;0.95;1" dur="4s" repeatCount="indefinite"/></rect>
    <text x="105" y="37" fill="#9aa4b5">filter() — lazy</text>
    <rect x="30" y="54" width="150" height="26" rx="6" fill="#1d222d" stroke="#333c4d"><animate attributeName="stroke" values="#333c4d;#333c4d;#3ddc97;#3ddc97;#333c4d" keyTimes="0;0.68;0.75;0.95;1" dur="4s" repeatCount="indefinite"/></rect>
    <text x="105" y="71" fill="#9aa4b5">groupBy() — lazy</text>
    <rect x="30" y="88" width="150" height="26" rx="6" fill="#1d222d" stroke="#333c4d"><animate attributeName="stroke" values="#333c4d;#333c4d;#3ddc97;#3ddc97;#333c4d" keyTimes="0;0.8;0.87;0.95;1" dur="4s" repeatCount="indefinite"/></rect>
    <text x="105" y="105" fill="#9aa4b5">sum() — lazy</text>

    <rect x="300" y="54" width="130" height="40" rx="8" fill="#3a2f16" stroke="#f5b74e"><animate attributeName="fill" values="#3a2f16;#3a2f16;#5a4410;#3a2f16" keyTimes="0;0.5;0.55;0.65" dur="4s" repeatCount="indefinite"/></rect>
    <text x="365" y="70" fill="#f5b74e" font-size="12">show()</text>
    <text x="365" y="85" fill="#a9832f" font-size="9">ACTION → run!</text>
  </g>
  <circle r="5" fill="#f5b74e" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.55;0.6;0.9;1" dur="4s" repeatCount="indefinite"/><animateMotion dur="4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.55;0.9;1" calcMode="linear" path="M300,74 L180,33 L180,67 L180,101"/></circle>
</svg>
<div class="codeblock">df = spark.read.csv("sales.csv", header=True)
big = df.filter(df.amount > 100)     # transformation (lazy)
top = big.groupBy("product").sum()   # transformation (lazy)
top.show()                            # ACTION → everything runs now</div>
<p>The practice below runs <strong>real Python</strong>. We use pandas with a Spark-style API so you feel the flow.</p>
`,
        practice: {
          type: "python",
          title: "Aggregate sales (Spark-style)",
          instructions:
            "Runs REAL Python via Pyodide. Compute total revenue per product and show the top sellers. Press Run.",
          starter: `import pandas as pd

orders = pd.DataFrame({
    "product": ["Laptop","Phone","Laptop","Tablet","Phone","Laptop"],
    "amount":  [1200,     800,    1200,    300,     800,    1200],
})

revenue = (orders
    .groupby("product")["amount"].sum()
    .reset_index(name="revenue")
    .sort_values("revenue", ascending=False))

result = revenue   # shown as a table + animated chart
print("Top products by revenue:")
print(revenue.to_string(index=False))`,
        },
      },
      {
        id: "spark-dataframe-ops",
        title: "DataFrame operations you'll use daily",
        level: "medium",
        minutes: 12,
        body: `
<h2>The everyday DataFrame toolkit</h2>
<p>In PySpark these are the operations you'll reach for constantly:</p>
<div class="codeblock">df.select("name", "amount")            # pick columns
df.filter(df.amount > 100)             # keep rows
df.withColumn("tax", df.amount * 0.1)  # add/derive a column
df.groupBy("product").agg(F.sum("amount"))
df.orderBy(F.desc("amount"))           # sort
df.dropDuplicates(["id"])              # dedupe
df.na.fill(0)                          # handle nulls</div>
<p>Below, practice cleaning + deriving columns for real (pandas mirrors the same ideas).</p>
`,
        practice: {
          type: "python",
          title: "Clean & enrich data",
          instructions:
            "Add a derived column, filter, and summarize. Real Python — press Run.",
          starter: `import pandas as pd

df = pd.DataFrame({
    "product": ["Laptop","Phone","Tablet","Phone","Laptop"],
    "amount":  [1200, 800, 300, 800, 1200],
    "country": ["US","IN","US","IN","UK"],
})

# add a 10% tax column (like withColumn)
df["tax"] = (df["amount"] * 0.10).round(2)

# only big orders, then revenue by country
big = df[df["amount"] >= 800]
by_country = (big.groupby("country")["amount"]
                .sum().reset_index(name="revenue")
                .sort_values("revenue", ascending=False))

result = by_country   # shown as a table + animated chart
print(df.to_string(index=False))
print("\\nRevenue by country (orders >= 800):")
print(by_country.to_string(index=False))`,
        },
      },
      {
        id: "spark-sql-joins",
        title: "Spark SQL, joins & window functions",
        level: "advanced",
        minutes: 12,
        body: `
<h2>Going advanced with Spark</h2>
<h3>🧮 Spark SQL</h3>
<p>Query DataFrames with plain SQL:</p>
<div class="codeblock">df.createOrReplaceTempView("sales")
spark.sql("SELECT product, SUM(amount) rev FROM sales GROUP BY product")</div>
<h3>🔗 Joins</h3>
<p>Combine DataFrames on a key. Types: <code>inner</code>, <code>left</code>, <code>right</code>, <code>outer</code>.</p>
<div class="codeblock">orders.join(customers, on="customer_id", how="inner")</div>
<h3>🪟 Window functions</h3>
<p>Compute across a "window" of rows without collapsing them — ranking, running totals, row numbers:</p>
<div class="codeblock">from pyspark.sql.window import Window
w = Window.partitionBy("country").orderBy(F.desc("amount"))
df.withColumn("rank", F.row_number().over(w))  # rank orders within each country</div>
<h3>Join types at a glance</h3>
<table class="tbl">
  <thead><tr><th>Join</th><th>Keeps</th></tr></thead>
  <tbody>
    <tr><td><code>inner</code></td><td>only rows matching in both tables</td></tr>
    <tr><td><code>left</code></td><td>all left rows + matches (nulls if none)</td></tr>
    <tr><td><code>right</code></td><td>all right rows + matches</td></tr>
    <tr><td><code>outer</code></td><td>all rows from both sides</td></tr>
  </tbody>
</table>
<div class="callout warn"><strong>Watch out:</strong> joins cause shuffles. If one side is small, <code>broadcast()</code> it to avoid the shuffle entirely.</div>
<p>Practice ranking below (pandas equivalent uses groupby+rank).</p>
`,
        practice: {
          type: "python",
          title: "Rank orders within each group",
          instructions: "Rank orders by amount within each country (a window function). Press Run.",
          starter: `import pandas as pd

df = pd.DataFrame({
    "country": ["US","US","IN","IN","US"],
    "product": ["Laptop","Phone","Phone","Tablet","Tablet"],
    "amount":  [1200, 800, 800, 300, 500],
})

# window: rank within each country by amount (desc)
df["rank"] = (df.sort_values("amount", ascending=False)
                .groupby("country").cumcount() + 1)

print(df.sort_values(["country","rank"]).to_string(index=False))`,
        },
      },
      {
        id: "spark-architecture",
        title: "Spark architecture: driver, executors & cluster",
        level: "advanced",
        minutes: 10,
        body: `
<h2>How Spark runs your job</h2>
<div class="diagram">
  <div class="node" style="background:#13263f;color:#6c8cff">Driver<br/><small>the boss</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">Executors<br/><small>the workers</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#12352a;color:#3ddc97">Partitions<br/><small>data pieces</small></div>
</div>
<ul>
  <li><strong>Driver</strong> — runs your main program, builds the plan, coordinates work.</li>
  <li><strong>Cluster Manager</strong> — hands out resources (YARN, Kubernetes, Standalone).</li>
  <li><strong>Executors</strong> — worker processes that run tasks and hold data in memory.</li>
  <li><strong>Job → Stages → Tasks</strong> — an action creates a <em>job</em>, split into <em>stages</em> (at shuffle boundaries), split into <em>tasks</em> (one per partition).</li>
</ul>
<div class="callout tip">More partitions = more parallelism (up to a point). The number of tasks in a stage = number of partitions.</div>
<h3>Job → Stages → Tasks</h3>
<p>When you call an action, Spark builds a plan and splits it:</p>
<div class="diagram">
  <div class="node" style="background:#3a2f16;color:#f5b74e">Job<br/><small>1 action</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#13263f;color:#6c8cff">Stages<br/><small>split at shuffles</small></div>
  <span class="arrow">→</span>
  <div class="node" style="background:#12352a;color:#3ddc97">Tasks<br/><small>1 per partition</small></div>
</div>
<div class="callout"><strong>Recap:</strong> The driver plans, the cluster manager gives resources, executors run tasks on partitions in parallel. An action creates a job → stages (at shuffle boundaries) → tasks (one per partition).</div>
`,
      },
      {
        id: "spark-performance",
        title: "Performance: shuffles, caching & partitioning",
        level: "advanced",
        minutes: 11,
        body: `
<h2>Making Spark jobs fast</h2>
<h3>💥 Shuffles (the #1 cost)</h3>
<p>Operations like <code>groupBy</code>, <code>join</code>, and <code>distinct</code> move data between executors — a <strong>shuffle</strong>. Shuffles are slow (network + disk). Minimize them.</p>
<h3>🚀 Broadcast joins</h3>
<p>Joining a huge table with a small one? <strong>Broadcast</strong> the small table to every executor to avoid a shuffle:</p>
<div class="codeblock">from pyspark.sql.functions import broadcast
big.join(broadcast(small), "id")</div>
<h3>🧠 Caching</h3>
<p>Reusing a DataFrame many times? <code>df.cache()</code> keeps it in memory so it isn't recomputed.</p>
<h3>🧩 Partitioning & skew</h3>
<ul>
  <li>Too few partitions → not enough parallelism. Too many tiny ones → overhead.</li>
  <li><strong>Data skew</strong> (one key has most rows) makes one task drag. Salt keys or use adaptive query execution (AQE).</li>
  <li>Write partitioned Parquet: <code>df.write.partitionBy("date").parquet(...)</code></li>
</ul>
<div class="callout warn">Golden rules: filter early, avoid unnecessary shuffles, broadcast small tables, cache reused data, and store as Parquet.</div>
<h3>Reading the Spark UI</h3>
<p>Spark's web UI shows each job's stages and how long tasks took. Signs of trouble:</p>
<ul>
  <li>One task takes far longer than the rest → <strong>data skew</strong>.</li>
  <li>Huge "Shuffle Read/Write" numbers → too much shuffling.</li>
  <li>Lots of tiny tasks → too many small partitions (coalesce them).</li>
</ul>
<div class="callout tip"><strong>Recap:</strong> Speed comes from doing less work and moving less data. Filter early, minimize shuffles, broadcast small tables, cache what you reuse, fix skew, and store columnar (Parquet).</div>
`,
      },
      {
        id: "spark-streaming",
        title: "Structured Streaming (real-time Spark)",
        level: "advanced",
        minutes: 10,
        body: `
<h2>Spark in real time</h2>
<p><strong>Structured Streaming</strong> treats a live stream as an endless DataFrame. You write almost the same code as batch — Spark runs it continuously in tiny <strong>micro-batches</strong>.</p>
<div class="codeblock">stream = (spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "orders").load())

parsed = stream.selectExpr("CAST(value AS STRING) AS json")

query = (parsed.writeStream.format("console")
    .outputMode("append").start())
query.awaitTermination()</div>
<h3>Key concepts</h3>
<ul>
  <li><strong>Triggers</strong> — how often micro-batches run.</li>
  <li><strong>Watermarks</strong> — how long to wait for late events before finalizing a window.</li>
  <li><strong>Checkpointing</strong> — saves progress so a restart resumes exactly-once.</li>
</ul>
<div class="callout tip">This is the exact pattern in the capstones: Kafka streams events → Spark aggregates live → results are stored in Snowflake.</div>
`,
      },
      {
        id: "spark-io",
        title: "Reading & Writing Data (sources & sinks)",
        level: "medium",
        minutes: 9,
        body: `
<h2>Getting data in and out of Spark</h2>
<p>Spark reads from and writes to many systems with a consistent API. The pattern is always <code>spark.read.format(...)</code> and <code>df.write.format(...)</code>.</p>
<h3>Reading</h3>
<div class="codeblock">spark.read.csv("data.csv", header=True, inferSchema=True)
spark.read.parquet("s3://bucket/data/")
spark.read.json("events.json")
spark.read.format("jdbc").option("url", db_url).option("dbtable", "orders").load()</div>
<h3>Writing &amp; save modes</h3>
<div class="codeblock">df.write.mode("overwrite").parquet("s3://bucket/out/")
df.write.mode("append").format("snowflake").options(**opts).save()</div>
<table class="tbl">
  <thead><tr><th>Mode</th><th>Behavior</th></tr></thead>
  <tbody>
    <tr><td><code>append</code></td><td>add new rows</td></tr>
    <tr><td><code>overwrite</code></td><td>replace existing data</td></tr>
    <tr><td><code>ignore</code></td><td>skip if data exists</td></tr>
    <tr><td><code>error</code></td><td>fail if data exists (default)</td></tr>
  </tbody>
</table>
<h3>Schemas: infer vs define</h3>
<p>Inferring a schema is handy for exploring, but in production you should <strong>define the schema</strong> explicitly — it's faster (no scan to guess types) and catches bad data early.</p>
<div class="callout tip"><strong>Recap:</strong> <code>read.format(...).load()</code> in, <code>write.format(...).mode(...).save()</code> out. Prefer Parquet, define schemas in production, and choose the save mode deliberately.</div>
`,
      },
      {
        id: "spark-running",
        title: "Running PySpark: setup, spark-submit & the UI (working style)",
        level: "medium",
        minutes: 11,
        body: `
<h2>Actually running Spark</h2>
<h3>1. Install &amp; start a session</h3>
<div class="codeblock">pip install pyspark

from pyspark.sql import SparkSession
spark = (SparkSession.builder
    .appName("my_job")
    .master("local[*]")        # use all local cores; "yarn"/"k8s" in prod
    .getOrCreate())</div>
<p><code>local[*]</code> runs Spark on your laptop — perfect for learning. The same code runs on a huge cluster by changing <code>master</code>.</p>
<h3>2. Two ways to run</h3>
<ul>
  <li><strong>Interactive</strong> — a notebook or <code>pyspark</code> shell while exploring.</li>
  <li><strong>Production</strong> — a script submitted with <code>spark-submit</code>:</li>
</ul>
<div class="codeblock">spark-submit \\
  --master yarn \\
  --executor-memory 4g \\
  --num-executors 10 \\
  my_job.py</div>
<h3>3. The knobs that matter</h3>
<table class="tbl">
  <thead><tr><th>Setting</th><th>What it controls</th></tr></thead>
  <tbody>
    <tr><td><code>--num-executors</code></td><td>how many workers</td></tr>
    <tr><td><code>--executor-memory</code></td><td>RAM per worker</td></tr>
    <tr><td><code>--executor-cores</code></td><td>parallel tasks per worker</td></tr>
    <tr><td><code>spark.sql.shuffle.partitions</code></td><td>partitions after a shuffle (default 200)</td></tr>
  </tbody>
</table>
<h3>4. The Spark UI (port 4040)</h3>
<p>While a job runs, open <code>localhost:4040</code> to see <strong>Jobs → Stages → Tasks</strong>, shuffle sizes, and which stage is slow. It's how you diagnose performance.</p>
<div class="callout warn"><strong>Common errors:</strong> <code>OutOfMemoryError</code> (raise executor memory or reduce partition size), and slow "straggler" tasks (data skew — see the performance lesson).</div>
<div class="callout"><strong>Recap:</strong> <code>SparkSession</code> with <code>local[*]</code> to learn; <code>spark-submit</code> with executor settings for prod; the port-4040 UI to watch and tune jobs.</div>
`,
      },
    ],
  },

  /* =============================== KAFKA ============================== */
  {
    id: "kafka",
    title: "Apache Kafka",
    icon: "🔀",
    tagline: "The streamer",
    summary:
      "Master real-time streaming: topics, partitions, offsets, producers, consumers, consumer groups, replication, delivery semantics & Kafka Connect.",
    lessons: [
      {
        id: "kafka-intro",
        title: "What is Kafka? Producers, topics & consumers",
        level: "easy",
        minutes: 8,
        body: `
<h2>Apache Kafka — the streamer</h2>
<p><strong>Kafka</strong> moves streams of events between systems in real time — think of it as a super-fast, durable <strong>message conveyor belt</strong> that many apps can write to and read from at once.</p>

<h3>See it flow</h3>
<p>Producers push events onto a <strong>topic</strong>; consumers read them off — continuously:</p>
<svg class="svg-diagram" viewBox="0 0 520 170" role="img" aria-label="Animation of a Kafka producer sending events to a topic which a consumer reads">
  <rect x="10" y="60" width="90" height="46" rx="8" fill="#2a2140" stroke="#b98bff"/>
  <text x="55" y="80" fill="#b98bff" font-size="12" text-anchor="middle">Producer</text>
  <text x="55" y="96" fill="#7c6aa8" font-size="9" text-anchor="middle">sends</text>

  <rect x="190" y="30" width="150" height="106" rx="10" fill="#171b24" stroke="#333c4d"/>
  <text x="265" y="24" fill="#d0b3ff" font-size="11" text-anchor="middle">Topic "orders"</text>
  <line x1="200" y1="55" x2="330" y2="55" stroke="#262d3a" stroke-width="8" stroke-linecap="round"/>
  <line x1="200" y1="83" x2="330" y2="83" stroke="#262d3a" stroke-width="8" stroke-linecap="round"/>
  <line x1="200" y1="111" x2="330" y2="111" stroke="#262d3a" stroke-width="8" stroke-linecap="round"/>
  <text x="345" y="59" fill="#6b7688" font-size="8">p0</text>
  <text x="345" y="87" fill="#6b7688" font-size="8">p1</text>
  <text x="345" y="115" fill="#6b7688" font-size="8">p2</text>

  <rect x="410" y="60" width="90" height="46" rx="8" fill="#2a2140" stroke="#b98bff"/>
  <text x="455" y="80" fill="#b98bff" font-size="12" text-anchor="middle">Consumer</text>
  <text x="455" y="96" fill="#7c6aa8" font-size="9" text-anchor="middle">reads</text>

  <circle r="6" fill="#3ddc97"><animateMotion dur="3s" repeatCount="indefinite" path="M100,83 H200 M200,55 H410"/></circle>
  <circle r="6" fill="#6c8cff"><animateMotion dur="3s" begin="-1s" repeatCount="indefinite" path="M100,83 H200 M200,83 H410"/></circle>
  <circle r="6" fill="#f5b74e"><animateMotion dur="3s" begin="-2s" repeatCount="indefinite" path="M100,83 H200 M200,111 H410"/></circle>
</svg>

<h3>Core vocabulary</h3>
<ul>
  <li><strong>Producer</strong> — an app that <em>sends</em> messages</li>
  <li><strong>Topic</strong> — a named stream messages go into</li>
  <li><strong>Partition</strong> — a topic is split into these for parallelism</li>
  <li><strong>Consumer</strong> — an app that <em>reads</em> messages</li>
  <li><strong>Broker</strong> — a Kafka server storing the messages</li>
  <li><strong>Cluster</strong> — several brokers working together</li>
</ul>

<h3>Why not just use a database or a queue?</h3>
<ul>
  <li><strong>vs a database:</strong> Kafka is built for a firehose of events (millions/sec) and for <em>many</em> readers, not random lookups.</li>
  <li><strong>vs a traditional queue:</strong> a classic queue deletes a message once one consumer reads it. Kafka <em>keeps</em> messages, so many independent consumers (and replays) are possible.</li>
</ul>

<h3>Where you'll see Kafka</h3>
<p>Order events in e-commerce, clickstreams, IoT sensor feeds, log aggregation, and as the "central nervous system" connecting microservices.</p>

<div class="callout tip"><strong>Key insight:</strong> Kafka keeps messages for a retention period even after they're read — so many consumers read the same stream independently, and you can replay history. That log-based design is Kafka's superpower.</div>

<div class="callout"><strong>Recap:</strong> Producers write events to a topic (split into partitions on brokers); consumers read them at their own pace. Durable, replayable, massively parallel.</div>
`,
      },
      {
        id: "kafka-partitions",
        title: "Partitions, offsets & consumer groups",
        level: "medium",
        minutes: 10,
        body: `
<h2>How Kafka scales: partitions</h2>
<p>A topic is split into <strong>partitions</strong>. More partitions = more consumers reading in parallel = higher throughput.</p>
<p>Messages are routed to a partition <strong>by their key</strong> — so the same key always lands in the same partition (keeping its events ordered). Watch keys route to their lanes:</p>
<svg class="svg-diagram" viewBox="0 0 520 160" role="img" aria-label="Animation of Kafka messages routing to partitions by key">
  <rect x="8" y="62" width="70" height="36" rx="7" fill="#2a2140" stroke="#b98bff"/>
  <text x="43" y="84" fill="#b98bff" font-size="10" text-anchor="middle">Producer</text>
  <g font-size="9" text-anchor="end">
    <text x="512" y="42" fill="#6b7688">partition 0</text>
    <text x="512" y="87" fill="#6b7688">partition 1</text>
    <text x="512" y="132" fill="#6b7688">partition 2</text>
  </g>
  <g stroke="#262d3a" stroke-width="8" stroke-linecap="round">
    <line x1="120" y1="38" x2="470" y2="38"/><line x1="120" y1="83" x2="470" y2="83"/><line x1="120" y1="128" x2="470" y2="128"/>
  </g>
  <circle r="6" fill="#6c8cff"><animateMotion dur="3s" repeatCount="indefinite" path="M78,80 L120,38 L470,38"/></circle>
  <circle r="6" fill="#6c8cff"><animateMotion dur="3s" begin="-1.5s" repeatCount="indefinite" path="M78,80 L120,38 L470,38"/></circle>
  <circle r="6" fill="#3ddc97"><animateMotion dur="3s" begin="-0.7s" repeatCount="indefinite" path="M78,80 L120,83 L470,83"/></circle>
  <circle r="6" fill="#f5b74e"><animateMotion dur="3s" begin="-2.1s" repeatCount="indefinite" path="M78,80 L120,128 L470,128"/></circle>
  <text x="150" y="20" fill="#6b7688" font-size="9">same key → same lane, in order</text>
</svg>
<h3>Offsets</h3>
<p>Each message in a partition gets a number — its <strong>offset</strong> (0,1,2…). A consumer tracks "I've read up to offset 42", so it never misses or repeats.</p>
<h3>Consumer groups</h3>
<p>Consumers with the same <strong>group id</strong> share the work — each partition goes to exactly one consumer in the group. Add consumers → Kafka <em>rebalances</em> automatically.</p>
<div class="callout"><strong>Ordering guarantee:</strong> messages are ordered <em>within a partition</em>, not across the whole topic. Choose a good key so related events land together.</div>
<p>Try the simulator: send messages and watch them land in partitions and get consumed in order.</p>
`,
        practice: {
          type: "kafka",
          title: "Produce & consume a stream",
          instructions:
            "Define the messages your producer sends. Press Run to watch them flow into partitions (by key) and get consumed in offset order.",
          starter: `# Each dict is one event sent to the "orders" topic.
messages = [
    {"key": "user1", "value": "Laptop  $1200"},
    {"key": "user2", "value": "Phone   $800"},
    {"key": "user1", "value": "Tablet  $300"},
    {"key": "user3", "value": "Phone   $800"},
    {"key": "user2", "value": "Laptop  $1200"},
]
partitions = 3`,
        },
      },
      {
        id: "kafka-producers",
        title: "Producers deep dive: keys, acks & batching",
        level: "medium",
        minutes: 10,
        body: `
<h2>Writing good producers</h2>
<div class="codeblock">from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    key_serializer=str.encode,
    value_serializer=lambda v: json.dumps(v).encode(),
    acks="all",          # durability
)
producer.send("orders", key="user1", value={"product": "Laptop"})
producer.flush()</div>
<h3>The key knobs</h3>
<ul>
  <li><strong>key</strong> — decides the partition (same key → same partition → ordered together).</li>
  <li><strong>acks</strong> — durability: <code>0</code> (fire & forget), <code>1</code> (leader only), <code>all</code> (leader + replicas, safest).</li>
  <li><strong>batching / linger.ms</strong> — group messages for throughput.</li>
  <li><strong>compression</strong> — snappy/lz4/zstd to save bandwidth.</li>
  <li><strong>idempotent producer</strong> — avoids duplicates on retry.</li>
</ul>
<div class="callout warn">Trade-off: <code>acks=all</code> is safest but slower; <code>acks=0</code> is fastest but can lose data. Pick per use case.</div>
<div class="callout tip"><strong>Recap:</strong> The <em>key</em> controls partitioning &amp; ordering; <em>acks</em> controls durability; batching/compression control throughput; the idempotent producer prevents duplicate messages on retry.</div>
`,
        practice: {
          type: "kafka",
          title: "Partitioning by key",
          instructions:
            "Notice how messages with the same key always land in the same partition. Change the keys and re-run to see routing change.",
          starter: `messages = [
    {"key": "orderA", "value": "created"},
    {"key": "orderA", "value": "paid"},
    {"key": "orderA", "value": "shipped"},
    {"key": "orderB", "value": "created"},
    {"key": "orderB", "value": "paid"},
]
partitions = 2`,
        },
      },
      {
        id: "kafka-consumers",
        title: "Consumers deep dive & offset management",
        level: "medium",
        minutes: 10,
        body: `
<h2>Reading reliably</h2>
<div class="codeblock">from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "orders",
    bootstrap_servers="localhost:9092",
    group_id="analytics",
    auto_offset_reset="earliest",  # start from beginning if no offset
    enable_auto_commit=False,      # commit manually after processing
    value_deserializer=lambda b: json.loads(b),
)
for msg in consumer:
    process(msg.value)
    consumer.commit()              # mark as done</div>
<h3>Delivery guarantees</h3>
<ul>
  <li><strong>At-most-once</strong> — commit before processing (may lose on crash).</li>
  <li><strong>At-least-once</strong> — commit after processing (may reprocess → make it idempotent). <em>Most common.</em></li>
  <li><strong>Exactly-once</strong> — transactions + idempotent producer (strongest, more setup).</li>
</ul>
<div class="callout tip"><strong>auto_offset_reset</strong> only matters when the group has <em>no</em> committed offset yet: <code>earliest</code> = from the start, <code>latest</code> = only new messages.</div>
<div class="callout"><strong>Recap:</strong> Consumers track their position with committed offsets. Commit <em>after</em> processing for at-least-once (and make processing idempotent). Scale by adding consumers to the same group.</div>
`,
      },
      {
        id: "kafka-replication",
        title: "Topics, replication & durability",
        level: "advanced",
        minutes: 9,
        body: `
<h2>How Kafka never loses your data</h2>
<h3>Replication</h3>
<p>Each partition is copied to several brokers (the <strong>replication factor</strong>, e.g. 3). One replica is the <strong>leader</strong> (handles reads/writes); the others are <strong>followers</strong> that stay in sync.</p>
<div class="diagram">
  <div class="node" style="background:#12352a;color:#3ddc97">Leader (broker 1)</div>
  <span class="arrow">⇄</span>
  <div class="node" style="background:#13263f;color:#6c8cff">Follower (broker 2)</div>
  <span class="arrow">⇄</span>
  <div class="node" style="background:#13263f;color:#6c8cff">Follower (broker 3)</div>
</div>
<p>If the leader dies, a follower is promoted — no data lost. <strong>ISR</strong> (in-sync replicas) are the followers fully caught up.</p>
<h3>Retention</h3>
<p>Kafka keeps messages for a configured time (e.g. 7 days) or size — not "until read". This is why it can replay history and feed many consumers.</p>
<div class="callout">Kafka is a <strong>durable log</strong>, not just a queue. That log-based design is what makes replay, multiple consumers, and stream processing possible.</div>
<div class="callout tip"><strong>Recap:</strong> Each partition is replicated across brokers (one leader, several followers). If a broker dies, a follower takes over — no data lost. Messages are retained by time/size, so history can be replayed.</div>
`,
      },
      {
        id: "kafka-connect-ecosystem",
        title: "Kafka Connect & the ecosystem",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Getting data in & out without code</h2>
<h3>Kafka Connect</h3>
<p><strong>Connect</strong> is a framework of ready-made <strong>connectors</strong> that move data between Kafka and other systems — no custom code.</p>
<ul>
  <li><strong>Source connectors</strong> — pull data <em>into</em> Kafka (e.g. a database via CDC/Debezium).</li>
  <li><strong>Sink connectors</strong> — push data <em>out</em> of Kafka (e.g. into <strong>Snowflake</strong>, S3, Elasticsearch).</li>
</ul>
<h3>The wider ecosystem</h3>
<ul>
  <li><strong>Schema Registry</strong> — enforces message schemas (Avro/Protobuf) so producers & consumers agree.</li>
  <li><strong>Kafka Streams / ksqlDB</strong> — process streams with a library or SQL.</li>
  <li><strong>Spark / Flink</strong> — heavy-duty stream processing engines that read Kafka.</li>
</ul>
<div class="callout tip">Real pipeline: DB → <em>Debezium source</em> → Kafka → Spark → <em>Snowflake sink</em> → analysts. Connect handles the plumbing at both ends.</div>
<div class="callout"><strong>Recap:</strong> Kafka Connect moves data in/out of Kafka with config-only connectors (sources &amp; sinks). Schema Registry enforces message shape; Streams/ksqlDB/Spark/Flink process the streams. You rarely write plumbing by hand.</div>
`,
      },
      {
        id: "kafka-spark-stream",
        title: "Kafka + Spark Structured Streaming",
        level: "advanced",
        minutes: 10,
        body: `
<h2>Real-time processing: Kafka → Spark</h2>
<p>The real power comes from connecting Kafka to Spark. Spark reads a Kafka topic as an endless DataFrame and processes it live.</p>
<div class="codeblock">stream = (spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "orders").load())

from pyspark.sql import functions as F
events = stream.select(
    F.from_json(F.col("value").cast("string"), schema).alias("e")
).select("e.*")

agg = events.groupBy("product").sum("amount")

query = (agg.writeStream.outputMode("complete")
    .format("console").start())</div>
<div class="callout tip">Spark processes micro-batches every few seconds, so aggregates update in near real time. This is the beating heart of the streaming capstones.</div>
<h3>Batch code vs streaming code</h3>
<table class="tbl">
  <thead><tr><th>Batch</th><th>Streaming</th></tr></thead>
  <tbody>
    <tr><td><code>spark.read</code></td><td><code>spark.readStream</code></td></tr>
    <tr><td><code>df.write</code></td><td><code>df.writeStream</code></td></tr>
    <tr><td>runs once</td><td>runs continuously</td></tr>
  </tbody>
</table>
<p>The transformations in between are almost identical — that's the beauty of Structured Streaming.</p>
<div class="callout"><strong>Recap:</strong> Structured Streaming = write batch-style code that runs continuously on micro-batches. Watermarks handle late data; checkpoints make restarts exactly-once.</div>
`,
      },
      {
        id: "kafka-schema-registry",
        title: "Schema Registry, Avro & error handling",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Keeping producers &amp; consumers in agreement</h2>
<p>If a producer changes its message shape, every consumer can break. The <strong>Schema Registry</strong> prevents that by storing and enforcing message schemas.</p>
<h3>How it works</h3>
<ol>
  <li>Producer registers its schema (Avro/Protobuf/JSON Schema) with the registry.</li>
  <li>Only a tiny <strong>schema ID</strong> is sent with each message (compact + fast).</li>
  <li>Consumers fetch the schema by ID to decode messages.</li>
  <li>The registry rejects <strong>incompatible</strong> schema changes before they cause outages.</li>
</ol>
<h3>Why Avro for streaming?</h3>
<ul>
  <li>Compact binary (smaller than JSON on the wire).</li>
  <li>Schema travels with the data model → strong typing.</li>
  <li>Supports safe <strong>schema evolution</strong> (add fields without breaking old consumers).</li>
</ul>
<h3>When messages go bad: dead-letter queues</h3>
<p>Some messages can't be processed (corrupt, wrong shape). Instead of crashing the consumer, route them to a separate <strong>dead-letter topic</strong> to inspect and replay later.</p>
<div class="diagram">
  <div class="node" style="background:#2a2140;color:#b98bff">Consumer</div>
  <span class="arrow">→</span>
  <div class="node" style="background:#3a1616;color:#ff8080">Dead-letter topic<br/><small>bad messages</small></div>
</div>
<div class="callout warn"><strong>Compatibility modes</strong> (backward/forward/full) decide which schema changes are allowed. Backward compatibility (new consumers read old data) is the most common default.</div>
<div class="callout tip"><strong>Recap:</strong> The Schema Registry enforces message contracts so producers and consumers evolve safely; Avro gives compact, typed, evolvable messages; dead-letter topics catch bad records without stopping the pipeline.</div>
`,
      },
      {
        id: "kafka-running",
        title: "Running Kafka: CLI & operations (working style)",
        level: "medium",
        minutes: 11,
        body: `
<h2>Actually running Kafka</h2>
<h3>1. Start a broker (Docker is easiest)</h3>
<div class="codeblock"># Modern Kafka (KRaft mode, no ZooKeeper) via Docker:
docker run -p 9092:9092 apache/kafka:latest</div>
<h3>2. The CLI commands you'll use constantly</h3>
<div class="codeblock"># create a topic with 3 partitions
kafka-topics.sh --create --topic orders \\
  --partitions 3 --bootstrap-server localhost:9092

# list / describe topics
kafka-topics.sh --list --bootstrap-server localhost:9092
kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092

# produce messages from the terminal
kafka-console-producer.sh --topic orders --bootstrap-server localhost:9092

# consume messages
kafka-console-consumer.sh --topic orders --from-beginning \\
  --bootstrap-server localhost:9092</div>
<h3>3. Watching consumer groups &amp; lag</h3>
<p><strong>Lag</strong> = how far behind a consumer is (unread messages). It's the #1 health metric.</p>
<div class="codeblock">kafka-consumer-groups.sh --describe --group analytics \\
  --bootstrap-server localhost:9092
# shows CURRENT-OFFSET, LOG-END-OFFSET, LAG per partition</div>
<div class="callout warn"><strong>Rising lag</strong> = consumers can't keep up. Fix by adding consumers to the group (up to the partition count) or making processing faster.</div>
<h3>4. In code (Python)</h3>
<div class="codeblock">pip install kafka-python
# then use KafkaProducer / KafkaConsumer (see the producer/consumer lessons)</div>
<div class="callout"><strong>Recap:</strong> Docker to run a broker; <code>kafka-topics</code>, <code>kafka-console-producer/consumer</code>, and <code>kafka-consumer-groups</code> to operate it; watch <strong>lag</strong> to know if consumers are keeping up.</div>
`,
      },
    ],
  },

  /* ============================= SNOWFLAKE ============================ */
  {
    id: "snowflake",
    title: "Snowflake",
    icon: "❄️",
    tagline: "The cloud data warehouse",
    summary:
      "The modern cloud warehouse: architecture, virtual warehouses, loading data, SQL analytics, time travel, and integrating with Spark/Kafka/Airflow.",
    lessons: [
      {
        id: "snowflake-intro",
        title: "What is Snowflake?",
        level: "easy",
        minutes: 8,
        body: `
<h2>Snowflake — the cloud data warehouse</h2>
<p><strong>Snowflake</strong> is a fully-managed cloud data warehouse. You load your data in, then run fast SQL analytics over huge tables — without managing a single server.</p>

<h3>The killer feature: storage &amp; compute are separate</h3>
<p>Many teams can run their own <strong>compute</strong> (virtual warehouses) over the <strong>same</strong> stored data — with zero contention. Watch three warehouses query one shared store at once:</p>
<svg class="svg-diagram" viewBox="0 0 520 200" role="img" aria-label="Animation of separate Snowflake compute warehouses querying shared storage">
  <g font-size="10" text-anchor="middle">
    <rect x="20" y="20" width="120" height="34" rx="7" fill="#3a2f16" stroke="#f5b74e"/><text x="80" y="41" fill="#f5b74e">BI warehouse</text>
    <rect x="20" y="83" width="120" height="34" rx="7" fill="#2a2140" stroke="#b98bff"/><text x="80" y="104" fill="#b98bff">Data science WH</text>
    <rect x="20" y="146" width="120" height="34" rx="7" fill="#13263f" stroke="#6c8cff"/><text x="80" y="167" fill="#6c8cff">ETL warehouse</text>
  </g>
  <rect x="330" y="66" width="170" height="70" rx="10" fill="#123a3f" stroke="#4ec9e0"/>
  <text x="415" y="96" fill="#4ec9e0" font-size="13" text-anchor="middle">Shared storage</text>
  <text x="415" y="114" fill="#2b7f8f" font-size="10" text-anchor="middle">one copy of the data</text>

  <circle r="5" fill="#f5b74e"><animateMotion dur="2s" repeatCount="indefinite" path="M140,37 L330,90"/></circle>
  <circle r="5" fill="#b98bff"><animateMotion dur="2s" begin="-0.6s" repeatCount="indefinite" path="M140,100 L330,101"/></circle>
  <circle r="5" fill="#6c8cff"><animateMotion dur="2s" begin="-1.2s" repeatCount="indefinite" path="M140,163 L330,112"/></circle>
</svg>

<h3>Why it's special</h3>
<ul>
  <li><strong>Separates storage from compute</strong> — scale each independently (the killer feature).</li>
  <li><strong>Runs on AWS, Azure, or GCP</strong> — you don't manage the infrastructure.</li>
  <li><strong>Pay for what you use</strong> — compute clusters auto spin up/down.</li>
  <li><strong>Handles structured &amp; semi-structured</strong> data (JSON) natively.</li>
  <li><strong>Near-zero admin</strong> — no indexes to tune, no vacuuming, no servers to patch.</li>
</ul>

<h3>Where it fits</h3>
<div class="diagram">
  <div class="node" style="background:#2a2140;color:#b98bff">Kafka</div><span class="arrow">→</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">Spark / ELT</div><span class="arrow">→</span>
  <div class="node" style="background:#123a3f;color:#4ec9e0">Snowflake</div><span class="arrow">→</span>
  <div class="node" style="background:#12352a;color:#3ddc97">BI / dashboards</div>
</div>

<div class="callout tip">Where Spark is the <em>processor</em> and Kafka the <em>streamer</em>, Snowflake is the <em>destination</em> — the single source of truth analysts query.</div>
<div class="callout"><strong>Recap:</strong> Snowflake = a serverless cloud warehouse where storage and compute scale separately, so everyone queries one copy of the data without stepping on each other.</div>
`,
      },
      {
        id: "snowflake-architecture",
        title: "Architecture: storage, compute & services",
        level: "medium",
        minutes: 9,
        body: `
<h2>Snowflake's three layers</h2>
<div class="diagram">
  <div class="node" style="background:#123a3f;color:#4ec9e0">Cloud Services<br/><small>brains</small></div>
  <span class="arrow">/</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">Compute<br/><small>virtual warehouses</small></div>
  <span class="arrow">/</span>
  <div class="node" style="background:#12352a;color:#3ddc97">Storage<br/><small>your data</small></div>
</div>
<ul>
  <li><strong>Storage layer</strong> — your data, compressed & columnar, in cloud object storage. Cheap and effectively unlimited.</li>
  <li><strong>Compute layer</strong> — <strong>virtual warehouses</strong> (clusters) that run queries. Many warehouses can hit the same data at once without slowing each other.</li>
  <li><strong>Cloud services layer</strong> — the brain: authentication, query optimization, metadata, transactions, security.</li>
</ul>
<div class="callout"><strong>The big idea:</strong> because storage and compute are separate, your data science team and your BI team can run on <em>separate</em> warehouses over the <em>same</em> data — no contention.</div>
<div class="callout tip"><strong>Recap:</strong> Three layers — storage (your data), compute (virtual warehouses that query it), and cloud services (the brain). Scale compute and storage independently; many warehouses share one copy of the data.</div>
`,
      },
      {
        id: "snowflake-objects",
        title: "Databases, schemas, tables & warehouses",
        level: "easy",
        minutes: 8,
        body: `
<h2>How Snowflake is organized</h2>
<div class="codeblock">-- containers
CREATE DATABASE sales_db;
CREATE SCHEMA sales_db.public;

-- a virtual warehouse = compute to run queries
CREATE WAREHOUSE analytics_wh
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60      -- pause after 60s idle (saves money)
  AUTO_RESUME = TRUE;

-- a table
CREATE TABLE orders (
  id INT, product STRING, amount NUMBER, order_date DATE
);</div>
<h3>The hierarchy</h3>
<p><strong>Account → Database → Schema → Table</strong>. Warehouses (compute) are separate from all of that — you attach one to run a query.</p>
<div class="callout tip"><strong>Warehouse ≠ database.</strong> In Snowflake a "warehouse" means <em>compute</em> (a cluster). Your data lives in <em>databases</em>. This trips up everyone at first.</div>
<div class="callout warn"><strong>Save money:</strong> set <code>AUTO_SUSPEND</code> so a warehouse pauses when idle — you only pay for compute while queries actually run.</div>
<div class="callout"><strong>Recap:</strong> Account → Database → Schema → Table holds your data; a Warehouse is separate compute you attach to run queries. Size warehouses to the workload and auto-suspend them to control cost.</div>
`,
      },
      {
        id: "snowflake-loading",
        title: "Loading data: stages, COPY & Snowpipe",
        level: "medium",
        minutes: 9,
        body: `
<h2>Getting data into Snowflake</h2>
<h3>1. Stages</h3>
<p>A <strong>stage</strong> is a landing area for files before loading. Internal (in Snowflake) or external (your S3/GCS/Azure bucket).</p>
<div class="codeblock">CREATE STAGE my_stage
  URL='s3://my-bucket/orders/'
  FILE_FORMAT=(TYPE=PARQUET);</div>
<h3>2. COPY INTO (bulk load)</h3>
<div class="codeblock">COPY INTO orders
FROM @my_stage
FILE_FORMAT=(TYPE=PARQUET)
ON_ERROR='CONTINUE';</div>
<h3>3. Snowpipe (continuous load)</h3>
<p><strong>Snowpipe</strong> auto-loads files the moment they land in the stage — near real-time ingestion, great after a Spark/Kafka job drops Parquet files.</p>
<h3>Semi-structured data</h3>
<p>Load JSON into a <code>VARIANT</code> column and query nested fields directly:</p>
<div class="codeblock">SELECT raw:customer.name AS name FROM events;</div>
<div class="callout">Typical ELT: Spark writes Parquet to S3 → Snowpipe/COPY loads it into a raw table → SQL transforms it into clean star-schema tables.</div>
<div class="callout tip"><strong>Recap:</strong> Files land in a <strong>stage</strong> → <strong>COPY INTO</strong> bulk-loads them (or <strong>Snowpipe</strong> loads continuously). Load JSON into a <code>VARIANT</code> column and query nested fields with dot/colon notation.</div>
`,
      },
      {
        id: "snowflake-sql",
        title: "Querying & analytics with SQL",
        level: "medium",
        minutes: 12,
        body: `
<h2>SQL analytics in Snowflake</h2>
<p>Once data is loaded, analysts live in SQL. The practice below runs <strong>real SQL</strong> in your browser against sample <code>customers</code>, <code>products</code> & <code>orders</code> tables.</p>
<h3>The essentials</h3>
<div class="codeblock">SELECT product, SUM(amount) AS revenue
FROM orders
GROUP BY product
ORDER BY revenue DESC;</div>
<h3>Joins & window functions work here too</h3>
<div class="codeblock">SELECT c.country, SUM(o.amount) AS revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
GROUP BY c.country;</div>
<div class="callout tip">Try editing the query below — join tables, group, filter, or rank. It executes for real.</div>
`,
        practice: {
          type: "sql",
          title: "Write real SQL",
          instructions:
            "Runs REAL SQL (via sql.js) against seeded tables: customers(id,name,country), products(id,name,category,price), orders(id,customer_id,product,amount,order_date). Edit the query and press Run.",
          starter: `SELECT
    c.country,
    COUNT(*)        AS num_orders,
    SUM(o.amount)   AS revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
GROUP BY c.country
ORDER BY revenue DESC;`,
        },
      },
      {
        id: "snowflake-features",
        title: "Time Travel, cloning & data sharing",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Snowflake's superpowers</h2>
<h3>⏳ Time Travel</h3>
<p>Query or restore data <em>as it was</em> up to 90 days ago — undo an accidental delete/update:</p>
<div class="codeblock">SELECT * FROM orders AT(OFFSET => -3600);   -- 1 hour ago
UNDROP TABLE orders;                          -- bring back a dropped table</div>
<h3>🧬 Zero-copy cloning</h3>
<p>Instantly clone a whole database/table without copying the data (great for dev/test copies of prod):</p>
<div class="codeblock">CREATE TABLE orders_dev CLONE orders;</div>
<h3>🤝 Secure data sharing</h3>
<p>Share live tables with another Snowflake account — no copying, no ETL. They query your data directly (governed by you).</p>
<div class="callout tip">Time Travel + cloning make Snowflake incredibly safe to experiment on: clone prod, break things, throw it away — the original is untouched.</div>
<div class="callout"><strong>Recap:</strong> Time Travel = query/restore past data (undo mistakes); zero-copy cloning = instant free copies for dev/test; secure sharing = give others live access with no ETL. These are Snowflake's standout features.</div>
`,
      },
      {
        id: "snowflake-integration",
        title: "Integrating Snowflake with Spark, Kafka & Airflow",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Snowflake in the modern data stack</h2>
<h3>Spark ↔ Snowflake</h3>
<p>The Spark–Snowflake connector reads/writes Snowflake as a DataFrame:</p>
<div class="codeblock">(df.write.format("snowflake")
   .options(**sf_opts).option("dbtable", "orders")
   .mode("append").save())</div>
<h3>Kafka → Snowflake</h3>
<p>The <strong>Snowflake Kafka Connector</strong> (a Connect sink) streams topics straight into tables — often paired with Snowpipe.</p>
<h3>Airflow → Snowflake</h3>
<p>Airflow orchestrates it all with the Snowflake provider:</p>
<div class="codeblock">from airflow.providers.snowflake.operators.snowflake import SnowflakeOperator
load = SnowflakeOperator(
    task_id="transform",
    snowflake_conn_id="snowflake_default",
    sql="INSERT INTO daily_revenue SELECT product, SUM(amount) FROM orders GROUP BY product",
)</div>
<div class="callout"><strong>Full picture:</strong> Kafka streams events → Spark processes → data lands in Snowflake → Airflow schedules & monitors the whole chain → analysts query Snowflake. That's a complete modern pipeline.</div>
<div class="callout tip"><strong>Recap:</strong> Snowflake plugs into everything — the Spark connector reads/writes DataFrames, the Kafka connector streams topics in, and Airflow's Snowflake operator runs SQL on a schedule. It's the destination the other three tools feed. You'll build exactly this in the capstones.</div>
`,
      },
      {
        id: "snowflake-governance",
        title: "Roles, access control & cost management",
        level: "advanced",
        minutes: 9,
        body: `
<h2>Running Snowflake safely and cheaply</h2>
<h3>🔐 Role-based access control (RBAC)</h3>
<p>In Snowflake you grant privileges to <strong>roles</strong>, then assign roles to users — never grant directly to people. This scales cleanly and is auditable.</p>
<div class="codeblock">CREATE ROLE analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA sales_db.public TO ROLE analyst;
GRANT ROLE analyst TO USER maya;</div>
<p>Roles form a hierarchy (e.g. <code>SYSADMIN</code> → <code>analyst</code>), so higher roles inherit lower-role access.</p>
<h3>💰 Where the money goes</h3>
<ul>
  <li><strong>Compute</strong> — warehouses bill per second while running (the main cost).</li>
  <li><strong>Storage</strong> — cheap, per TB of compressed data.</li>
  <li><strong>Cloud services</strong> — usually small.</li>
</ul>
<h3>Cost-control checklist</h3>
<ul>
  <li>✅ <code>AUTO_SUSPEND</code> warehouses (pause when idle)</li>
  <li>✅ Right-size warehouses — bigger only for genuinely heavy queries</li>
  <li>✅ Use <strong>resource monitors</strong> to cap credits and alert on spend</li>
  <li>✅ Separate warehouses per team so you can see who spends what</li>
  <li>✅ Lean on result caching — identical queries can return instantly, free</li>
</ul>
<div class="callout warn"><strong>Classic bill shock:</strong> a huge warehouse left running overnight, or <code>AUTO_SUSPEND</code> disabled. Always set auto-suspend.</div>
<div class="callout tip"><strong>Recap:</strong> Grant access via roles (RBAC), not to individuals. Compute is the main cost — auto-suspend, right-size, and use resource monitors to keep the bill predictable.</div>
`,
      },
      {
        id: "snowflake-working",
        title: "Working in Snowflake: worksheets, SnowSQL & connectors (working style)",
        level: "medium",
        minutes: 10,
        body: `
<h2>Actually working in Snowflake</h2>
<h3>1. Sign up &amp; the web UI (Snowsight)</h3>
<p>Snowflake has a <strong>free 30-day trial</strong>. You mostly work in <strong>Snowsight</strong> — the web UI — writing SQL in <strong>worksheets</strong>. Pick a <em>role</em> and a <em>warehouse</em> at the top, then run queries.</p>
<h3>2. The session context (always set these)</h3>
<div class="codeblock">USE ROLE analyst;
USE WAREHOUSE analytics_wh;
USE DATABASE sales_db;
USE SCHEMA public;

SELECT * FROM orders LIMIT 10;</div>
<h3>3. SnowSQL — the command-line client</h3>
<div class="codeblock">snowsql -a &lt;account&gt; -u &lt;user&gt;
# then run SQL, or scripts:
snowsql -f load_orders.sql</div>
<h3>4. Connecting from code</h3>
<div class="codeblock"># Python
pip install snowflake-connector-python
import snowflake.connector
con = snowflake.connector.connect(user=..., password=..., account=...)
con.cursor().execute("SELECT COUNT(*) FROM orders")</div>
<p>Spark uses the Spark–Snowflake connector; Airflow uses the <code>SnowflakeOperator</code>; BI tools (Tableau, Power BI) connect directly.</p>
<h3>5. The daily loop</h3>
<ol>
  <li>Load raw data (COPY / Snowpipe) into a raw table.</li>
  <li>Transform with SQL (often via <strong>dbt</strong>) into clean star-schema tables.</li>
  <li>Analysts &amp; dashboards query the clean tables.</li>
</ol>
<div class="callout tip"><strong>Recap:</strong> Work in Snowsight worksheets (set role + warehouse), script with SnowSQL, connect from Python/Spark/Airflow/BI. The rhythm is load raw → transform with SQL → serve clean tables.</div>
`,
      },
    ],
  },

  /* ============================== CAPSTONE ============================= */
  {
    id: "capstone",
    title: "Capstone Projects",
    icon: "🏆",
    tagline: "Build it all together",
    summary:
      "Apply everything: build real pipelines wiring Kafka → Spark → Snowflake, orchestrated by Airflow, in the Project Builder.",
    lessons: [
      {
        id: "capstone-brief",
        title: "How the capstone projects work",
        level: "advanced",
        minutes: 6,
        body: `
<h2>🏆 Capstone Projects</h2>
<p>Time to combine everything. Each capstone is a real pipeline you build in the <strong>Project Builder</strong> — write real code in each stage, run it, and watch data flow through all the tools.</p>
<h3>Available projects</h3>
<ul>
  <li><strong>Real-Time Sales Analytics</strong> — Kafka → Spark → Snowflake (streaming)</li>
  <li><strong>E-commerce Clickstream</strong> — sessionize user clicks and find funnels</li>
  <li><strong>IoT Sensor Monitoring</strong> — detect anomalies in device readings</li>
  <li><strong>Daily Batch ETL to Warehouse</strong> — classic Airflow-scheduled ELT</li>
</ul>
<div class="diagram">
  <div class="node" style="background:#2a2140;color:#b98bff">Kafka</div><span class="arrow">→</span>
  <div class="node" style="background:#3a2f16;color:#f5b74e">Spark</div><span class="arrow">→</span>
  <div class="node" style="background:#123a3f;color:#4ec9e0">Snowflake</div>
</div>
<h3>How to build one</h3>
<ol>
  <li>Open the <strong>Project Builder</strong> (sidebar) and pick a project template.</li>
  <li>Click each block to edit its real code (Kafka producer, Spark job, Airflow DAG, Snowflake load).</li>
  <li>Press <strong>▶ Run pipeline</strong> — the Spark stage runs for real; watch data flow end to end.</li>
  <li><strong>Save</strong> — it lands in "My Projects".</li>
</ol>
<div class="callout tip">Start with Real-Time Sales Analytics, then try the others. Each teaches a different real-world pattern.</div>
`,
      },
    ],
  },
];

/* ----------------------- helper lookups ----------------------- */
export const ALL_LESSONS = TRACKS.flatMap((t) =>
  t.lessons.map((l) => ({ ...l, trackId: t.id, trackTitle: t.title, trackIcon: t.icon }))
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export function getTrack(id) {
  return TRACKS.find((t) => t.id === id);
}
export function getLesson(id) {
  return ALL_LESSONS.find((l) => l.id === id);
}
export function nextLesson(id) {
  const i = ALL_LESSONS.findIndex((l) => l.id === id);
  return i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null;
}