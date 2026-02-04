# Feedback Ingestion Research Report

**Date:** 2026-02-04
**Topic:** Feedback Ingestion API for PM Analyzer
**Status:** Completed

## 1. Executive Summary

For Phase 2 (Feedback Ingestion), we recommend a **Queue-based architecture** using **Vercel AI SDK** (`@ai-sdk/openai`) for embeddings and **Prisma** with `pgvector` for storage.

The cost for embedding 1,000 feedback items is negligible (~$0.01), so optimization should focus on **latency and reliability** (rate limits) rather than raw token cost.

## 2. OpenAI Embeddings Strategy

### Recommended Model
- **Model:** `text-embedding-3-small`
- **Dimensions:** 1536 (default).
- **Why:** significantly cheaper and better performance than `ada-002`.

### Batching & Chunking
- **Token Limit:** The model has a max context window of **8,192 tokens**.
- **Batching:** The API accepts an array of inputs.
  - *Strategy:* Batch 50-100 items per API call to reduce network overhead.
  - *Hard Limit:* Monitor total tokens per batch to stay under TPM (Tokens Per Minute) limits.
- **Chunking:**
  - Most feedback is short (<500 tokens).
  - For long feedback (>8k tokens), use a "recursive character" chunking strategy (available in libraries like `langchain` or custom implementation) with ~100 token overlap.

### Cost Estimates
- **Price:** $0.02 / 1M tokens.
- **Scenario:** 1,000 feedback items @ avg 500 tokens/item = 500,000 tokens.
- **Total Cost:** **$0.01 USD**.
- *Conclusion:* Cost is not a primary constraint.

## 3. Architecture: SDK & Libraries

### Decision: Use Vercel AI SDK Core (`@ai-sdk/openai`)
We recommend using the Vercel AI SDK over the raw OpenAI SDK for the following reasons:
- **Unified API:** Future-proofs us if we switch to other providers (e.g., Cohere, Mistral).
- **`embedMany`:** Native helper for generating embeddings for an array of values.
- **Helpers:** Built-in retry logic and error handling.

**Recommended Packages:**
```bash
npm install ai @ai-sdk/openai zod csv-parse
# Optional: BullMQ for queueing
npm install bullmq
```

## 4. Database: Prisma + pgvector

Prisma support for `pgvector` is available via the `Unsupported` type and raw SQL queries.

### Schema Setup
1. **Enable Extension:** Create a migration to run `CREATE EXTENSION IF NOT EXISTS vector;`.
2. **Schema Definition:**
```prisma
model Feedback {
  id        String   @id @default(uuid())
  content   String
  // Use Unsupported for vector type
  embedding Unsupported("vector(1536)")? 
  
  createdAt DateTime @default(now())
  
  @@index([embedding], name: "embedding_index", type: Hnsw) // *Requires raw SQL index creation, see below
}
```

### Similarity Search Pattern
Prisma does not yet support vector operators in the typed client. Use `$queryRaw`:

```typescript
const embedding = await generateEmbedding(query);
const vectorQuery = `[${embedding.join(",")}]`;

const result = await prisma.$queryRaw`
  SELECT id, content, 1 - (embedding <=> ${vectorQuery}::vector) as similarity
  FROM "Feedback"
  ORDER BY similarity DESC
  LIMIT 5;
`;
```

### Indexing for Production
For >10k rows, an index is critical for performance.
- **HNSW (Hierarchical Navigable Small World):** Faster search, higher build time/memory. Recommended for production.
- **IVFFlat:** Lower memory, faster build, lower recall.
- **Migration SQL:**
```sql
CREATE INDEX "embedding_index" ON "Feedback" USING hnsw (embedding vector_cosine_ops);
```

## 5. File Upload & Processing Patterns

### Processing Flow
1. **Upload:** User POSTs CSV file.
2. **Parse:** Stream file using `csv-parse` (memory efficient).
3. **Queue:** Push items to a Redis queue (BullMQ). **Do not embed synchronously.**
4. **Worker:**
   - Pull batch of 50 items.
   - Call `embedMany`.
   - Write to DB.

### Code Pattern (File Parsing)
```typescript
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

const parser = createReadStream('upload.csv').pipe(
  parse({ columns: true, skip_empty_lines: true })
);

for await (const record of parser) {
  // Validate with Zod
  const feedback = FeedbackSchema.parse(record);
  // Push to Queue
  await feedbackQueue.add('process', feedback);
}
```

## 6. Production Considerations

- **Rate Limiting:** OpenAI has strict TPM limits.
  - *Solution:* The Queue worker concurrency controls the ingestion rate. If you hit 429s, reduce worker concurrency.
- **Error Handling:**
  - Wrap OpenAI calls in a retry block (exponential backoff).
  - AI SDK handles some retries automatically.
- **Security:**
  - **Prompt Injection:** Not directly applicable to embeddings, but ensure no PII is embedded without sanitization.
  - **Malicious CSVs:** Use safe CSV parsers (csv-parse) and limit file size (e.g., 10MB).

## 7. Next Steps
1. Initialize Prisma migration for `vector` extension.
2. Set up BullMQ + Redis for the ingestion worker.
3. Implement the `embedMany` logic using Vercel AI SDK.
