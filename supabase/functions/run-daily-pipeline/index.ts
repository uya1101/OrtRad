import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { logCollectionResult } from '../_shared/logger.ts';

interface PipelineStep {
  name: string;
  url: string;
}

// Edge Functions to call in sequence
const PIPELINE_STEPS: PipelineStep[] = [
  {
    name: 'collect-pubmed',
    url: '/functions/v1/collect-pubmed',
  },
  {
    name: 'collect-rss',
    url: '/functions/v1/collect-rss',
  },
  {
    name: 'summarize-articles',
    url: '/functions/v1/summarize-articles',
  },
  {
    name: 'generate-trends',
    url: '/functions/v1/generate-trends',
  },
];

// Get base URL for function calls
function getFunctionBaseUrl(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable not set');
  }
  return supabaseUrl;
}

async function callEdgeFunction(
  step: PipelineStep,
  serviceKey: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const baseUrl = getFunctionBaseUrl();
    const url = `${baseUrl}${step.url}`;

    console.log(`Calling ${step.name}: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`${step.name} failed:`, response.status, data);
      return { success: false, error: `HTTP ${response.status}: ${JSON.stringify(data)}` };
    }

    console.log(`${step.name} completed:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error calling ${step.name}:`, error);
    return { success: false, error: String(error) };
  }
}

async function runPipeline(serviceKey: string): Promise<{
  success: boolean;
  results: Array<{
    step: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
}> {
  const results = [];

  for (const step of PIPELINE_STEPS) {
    console.log(`\n=== Starting step: ${step.name} ===`);

    const result = await callEdgeFunction(step, serviceKey);
    results.push({
      step: step.name,
      ...result,
    });

    // Continue to next step even if current step fails
    console.log(`=== Completed step: ${step.name} ===\n`);

    // Wait 5 seconds after collection steps to ensure DB writes complete
    if (step.name === 'collect-pubmed' || step.name === 'collect-rss') {
      console.log('Waiting 5 seconds for database writes to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Small delay between summary steps
    if (step.name === 'summarize-articles') {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Check if all steps succeeded
  const allSuccess = results.every(r => r.success);

  return { success: allSuccess, results };
}

serve(async (req) => {
  console.log('run-daily-pipeline function invoked');
  const startTime = Date.now();

  try {
    // Only allow POST from Supabase cron
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization
    const authHeader = req.headers.get('authorization');
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY');
    if (!serviceKey) {
      console.error('SERVICE_ROLE_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authorization verified, starting pipeline...');

    // Run pipeline
    const { success, results } = await runPipeline(serviceKey);

    const duration = Date.now() - startTime;
    console.log(`Pipeline completed in ${duration}ms`);

    // Log pipeline completion
    await logCollectionResult(
      'daily-pipeline',
      success ? 'completed' : 'failed',
      0,
      0,
      success ? undefined : 'Some steps failed'
    );

    // Prepare summary
    const summary = {
      message: success ? 'Pipeline completed successfully' : 'Pipeline completed with errors',
      duration_ms: duration,
      results,
      summary: {
        total_steps: results.length,
        successful_steps: results.filter(r => r.success).length,
        failed_steps: results.filter(r => !r.success).length,
      },
    };

    // Return response with appropriate status
    return new Response(
      JSON.stringify(summary),
      {
        status: success ? 200 : 207, // 207 Multi-Status for partial success
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error in run-daily-pipeline:', error);

    // Log error
    await logCollectionResult('daily-pipeline', 'failed', 0, 0, String(error));

    return new Response(
      JSON.stringify({
        error: String(error),
        duration_ms: duration,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
