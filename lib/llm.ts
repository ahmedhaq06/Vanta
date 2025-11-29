const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const PRIMARY_MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free';
// Fallback models (order matters)
const FALLBACK_MODELS = [
  'meta-llama/Llama-3-8b-chat',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'google/gemma-7b-it'
];
const API_ENDPOINT = 'https://api.together.xyz/v1/chat/completions';

interface EmailGenerationParams {
  name: string;
  bio: string;
  recent_posts: string;
  job_title: string;
  platform: string;
}

export async function generatePersonalizedEmail(params: EmailGenerationParams): Promise<string> {
  const { name, bio, recent_posts, job_title, platform } = params;

  const prompt = `You are an expert cold email writer. Write a hyper-personalized 2-paragraph sales email to ${name}.

Context:
- Platform: ${platform}
- Job Title: ${job_title || 'Not specified'}
- Bio: ${bio || 'Not available'}
- Recent Activity: ${recent_posts || 'Not available'}

Requirements:
- Tone: Casual but professional
- Length: 2 paragraphs maximum
- Reference specific details from their bio or recent posts
- Include a clear call-to-action
- Make it feel personal, not templated
- No subject line, just the email body

Write the email now:`;

  // Fallback simple template generator (used if API key missing or all attempts fail)
  const fallbackTemplate = () => {
    return `Hey ${name},\n\nI was checking out your ${platform} presence and noticed ${job_title ? 'your role as ' + job_title : 'your profile'}.$
We help founders and professionals streamline outreach with AI-personalized messages. ${bio ? 'Loved the bit in your bio about "' + bio.slice(0, 60) + '".' : ''}\n\nWould it be a bad idea to send you a quick 2 minute overview?\n\nCheers,\nAhmed`;
  };

  if (!TOGETHER_API_KEY) {
    console.warn('⚠ TOGETHER_API_KEY missing. Using fallback template.');
    return fallbackTemplate();
  }

  const attemptModels = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  console.log(`🧠 LLM Request for ${name}:`, { platform, job_title, bioLength: (bio||'').length, postsLength: (recent_posts||'').length });
  for (const model of attemptModels) {
    try {
      console.log(`🧠 Attempting LLM generation with model: ${model}`);
      const requestBody = {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes concise, personalized cold emails.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      };
      console.log('🧠 Request payload:', { model, messageCount: requestBody.messages.length, max_tokens: 500 });
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await safeReadResponse(response);
        console.error(`❌ Model ${model} failed (${response.status} ${response.statusText}). Body:`, errText);
        continue; // try next model
      }

      const data = await response.json();
      const generatedEmail = data.choices?.[0]?.message?.content || '';
      if (!generatedEmail) {
        console.warn(`⚠ Empty content from model ${model}. Trying next.`);
        continue;
      }
      console.log(`✅ LLM generation succeeded with model: ${model}`);
      console.log(`✅ Generated email preview (first 150 chars): ${generatedEmail.slice(0,150)}...`);
      console.log(`✅ Email stats: ${generatedEmail.length} chars, ${generatedEmail.split('\n').length} paragraphs`);
      return generatedEmail.trim();
    } catch (err) {
      console.error(`⚠ Error during LLM call for model ${model}:`, err);
      // transient network or parse error -> try next model
      continue;
    }
  }

  console.warn('⚠ All LLM model attempts failed. Using fallback template.');
  return fallbackTemplate();
}

async function safeReadResponse(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable body>';
  }
}
