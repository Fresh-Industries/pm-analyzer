import { generateEmbeddings } from './embeddings';
import { openai } from '@ai-sdk/openai';
import { generateStructuredOutput } from './ai';
import { z } from 'zod';

// Clustering types
export interface FeedbackItem {
  id: string;
  text: string;
  type: 'bug' | 'feature' | 'other' | null;
  customerTier: string | null;
  source: string | null;
}

export interface ClusterResult {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature';
  impact: 'high' | 'medium' | 'low';
  impactScore: number;
  feedbackCount: number;
  enterpriseCount: number;
  examples: string[];
  feedbackIds: string[];
}

export interface ClusteringOutput {
  clusters: ClusterResult[];
  unclustered: string[]; // IDs of feedback that didn't fit any cluster
}

// Schema for AI-generated cluster description
const ClusterDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['bug', 'feature']),
  isHighImpact: z.boolean(),
  rationale: z.string(),
});

type ClusterDescription = z.infer<typeof ClusterDescriptionSchema>;

// Simple cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// K-means clustering implementation
async function kMeansClustering(
  embeddings: number[][],
  feedbackItems: FeedbackItem[],
  k: number,
  maxIterations: number = 10
): Promise<number[]> {
  // Initialize centroids randomly
  const centroids: number[][] = [];
  const usedIndices = new Set<number>();
  
  while (centroids.length < k && usedIndices.size < feedbackItems.length) {
    const idx = Math.floor(Math.random() * feedbackItems.length);
    if (!usedIndices.has(idx)) {
      centroids.push([...embeddings[idx]]);
      usedIndices.add(idx);
    }
  }
  
  let assignments: number[] = new Array(feedbackItems.length).fill(-1);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = feedbackItems.map((_, i) => {
      let minDist = -1;
      let minIdx = 0;
      
      for (let c = 0; c < centroids.length; c++) {
        const sim = cosineSimilarity(embeddings[i], centroids[c]);
        if (minDist === -1 || sim > minDist) {
          minDist = sim;
          minIdx = c;
        }
      }
      
      return minIdx;
    });
    
    // Check for convergence
    let changed = false;
    for (let i = 0; i < assignments.length; i++) {
      if (assignments[i] !== newAssignments[i]) {
        changed = true;
        break;
      }
    }
    
    assignments = newAssignments;
    if (!changed) break;
    
    // Update centroids
    for (let c = 0; c < centroids.length; c++) {
      const clusterPoints = assignments
        .map((a, i) => (a === c ? i : -1))
        .filter((i) => i !== -1);
      
      if (clusterPoints.length > 0) {
        // Average of all points in cluster
        const newCentroid = new Array(embeddings[0].length).fill(0);
        for (const idx of clusterPoints) {
          for (let d = 0; d < embeddings[idx].length; d++) {
            newCentroid[d] += embeddings[idx][d];
          }
        }
        for (let d = 0; d < newCentroid.length; d++) {
          newCentroid[d] /= clusterPoints.length;
        }
        centroids[c] = newCentroid;
      }
    }
  }
  
  return assignments;
}

// Generate meaningful title and description for a cluster using AI
async function generateClusterDescription(
  feedbackTexts: string[],
  category: 'bug' | 'feature'
): Promise<ClusterDescription> {
  const examples = feedbackTexts.slice(0, 5).join('\n- ');
  const prompt = `
Analyze these ${feedbackTexts.length} customer feedback items about a software product:

${examples}

Category: ${category === 'bug' ? 'Bug reports' : 'Feature requests'}

Generate:
1. A concise title (3-5 words) that captures the theme
2. A description (1-2 sentences) explaining the issue/opportunity
3. Whether this is HIGH impact (affects many users or blocks work)
4. A brief rationale for your assessment

Return as JSON with keys: title, description, category, isHighImpact, rationale
`;

  try {
    const result = await generateStructuredOutput({
      model: 'google:gemini-3-pro-preview',
      prompt,
      schema: ClusterDescriptionSchema,
    });
    
    return {
      ...result,
      category, // Ensure category matches our classification
    };
  } catch (error) {
    console.error('Failed to generate cluster description:', error);
    // Fallback to simple extraction
    const title = category === 'bug' 
      ? `${feedbackTexts.length} reports about` 
      : `${feedbackTexts.length} requests for`;
    const keywords = feedbackTexts[0]?.split(' ').slice(0, 3).join(' ') || 'improvement';
    
    return {
      title: `${title} ${keywords}`,
      description: feedbackTexts[0] || '',
      category,
      isHighImpact: feedbackTexts.length >= 3,
      rationale: `Based on ${feedbackTexts.length} similar feedback items`,
    };
  }
}

// Main clustering function
export async function clusterFeedback(
  feedbackItems: FeedbackItem[]
): Promise<ClusteringOutput> {
  if (feedbackItems.length === 0) {
    return { clusters: [], unclustered: [] };
  }
  
  // Determine optimal number of clusters (between 3 and min(10, feedback count))
  const feedbackCount = feedbackItems.length;
  const k = Math.min(Math.max(3, Math.floor(feedbackCount / 3)), 10);
  
  if (feedbackCount < 3) {
    // Too few items, just return each as its own "cluster"
    return {
      clusters: feedbackItems.map((item, idx) => ({
        id: `cluster-${idx}`,
        title: item.text.slice(0, 30) + '...',
        description: item.text,
        category: (item.type as 'bug' | 'feature') || 'feature',
        impact: item.type === 'bug' ? 'high' : 'medium',
        impactScore: 50,
        feedbackCount: 1,
        enterpriseCount: item.customerTier === 'enterprise' ? 1 : 0,
        examples: [item.text],
        feedbackIds: [item.id],
      })),
      unclustered: [],
    };
  }
  
  // Generate embeddings for all feedback
  const texts = feedbackItems.map((f) => f.text);
  const embeddings = await generateEmbeddings(texts);
  
  // Cluster using k-means
  const assignments = await kMeansClustering(embeddings, feedbackItems, k);
  
  // Group feedback by cluster
  const clusters: Map<number, FeedbackItem[]> = new Map();
  const unclusteredIds: Set<string> = new Set();
  
  for (let i = 0; i < feedbackItems.length; i++) {
    const clusterIdx = assignments[i];
    // Only include if cluster has at least 2 items
    const clusterItems = clusters.get(clusterIdx) || [];
    clusterItems.push(feedbackItems[i]);
    
    // Check cluster size threshold
    if (clusterItems.length >= 2) {
      clusters.set(clusterIdx, clusterItems);
    } else {
      // Mark as potential unclustered
      if (!clusters.has(clusterIdx)) {
        unclusteredIds.add(feedbackItems[i].id);
      }
    }
  }
  
  // Generate descriptions for each cluster
  const clusterResults: ClusterResult[] = [];
  
  for (const [clusterIdx, items] of Array.from(clusters.entries())) {
    if (items.length < 2) {
      // These are small clusters, add to unclustered
      items.forEach((item) => unclusteredIds.add(item.id));
      continue;
    }
    
    // Determine primary category (bug vs feature)
    const bugCount = items.filter((i) => i.type === 'bug').length;
    const category: 'bug' | 'feature' = bugCount > items.length / 2 ? 'bug' : 'feature';
    
    // Generate AI description
    const description = await generateClusterDescription(
      items.map((i) => i.text),
      category
    );
    
    // Calculate impact score
    let impactScore = 0;
    let enterpriseCount = 0;
    
    for (const item of items) {
      impactScore += item.type === 'bug' ? 20 : 15;
      if (item.customerTier === 'enterprise') {
        impactScore += 30;
        enterpriseCount++;
      } else if (item.customerTier === 'pro') {
        impactScore += 15;
      } else {
        impactScore += 5;
      }
    }
    
    // Volume bonus
    if (items.length >= 5) impactScore += 30;
    else if (items.length >= 3) impactScore += 15;
    else if (items.length >= 2) impactScore += 5;
    
    impactScore = Math.min(impactScore, 100);
    
    // Override impact if AI says high
    if (description.isHighImpact && impactScore < 75) {
      impactScore = 75;
    }
    
    clusterResults.push({
      id: `cluster-${clusterIdx}`,
      title: description.title,
      description: description.description,
      category,
      impact: impactScore >= 75 ? 'high' : impactScore >= 40 ? 'medium' : 'low',
      impactScore,
      feedbackCount: items.length,
      enterpriseCount,
      examples: items.slice(0, 3).map((i) => i.text),
      feedbackIds: items.map((i) => i.id),
    });
  }
  
  // Sort by impact score
  clusterResults.sort((a, b) => b.impactScore - a.impactScore);
  
  return {
    clusters: clusterResults,
    unclustered: Array.from(unclusteredIds),
  };
}
