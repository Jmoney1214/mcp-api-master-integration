#!/usr/bin/env node
/**
 * ANTHROPIC CLAUDE API - COMPLETE CONNECTION GUIDE
 * ================================================
 * Line-by-line guide to Claude API (Claude 3 Opus, Sonnet, Haiku)
 * Text generation, vision, tool use, streaming
 */

// STEP 1: Import required packages
import Anthropic from '@anthropic-ai/sdk';      // Official Anthropic SDK
import fs from 'fs';                            // File system operations
import dotenv from 'dotenv';                    // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-bRzM-Fvaq9kZIxo64EkLCxGzJRhMD5PDwrDOCdT4-LzLMC7b7EUGg_CQyeXq4fLgI1F8LdL5B_Y5FTOJy-oM9A-9E8s8wAA';

// STEP 4: Initialize Claude client
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

// STEP 5: Claude API class wrapper
class ClaudeAPI {
  constructor() {
    this.anthropic = anthropic;
    this.models = {
      opus: 'claude-3-opus-20240229',      // Most capable, best for complex tasks
      sonnet: 'claude-3-5-sonnet-20241022', // Latest Sonnet 3.5
      haiku: 'claude-3-haiku-20240307',    // Fast and efficient
      legacy: 'claude-2.1'                  // Previous generation
    };
  }

  // STEP 6: Basic message completion
  async complete(prompt, options = {}) {
    try {
      const message = await this.anthropic.messages.create({
        model: options.model || this.models.sonnet,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        system: options.system || 'You are a helpful AI assistant.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        top_p: options.topP,
        top_k: options.topK,
        metadata: options.metadata,
        stop_sequences: options.stopSequences
      });

      console.log('💬 Claude Response:', message.content[0].text.substring(0, 200) + '...');
      console.log('📊 Usage:', {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      });

      return message.content[0].text;
    } catch (error) {
      console.error('❌ Completion failed:', error.message);
      return null;
    }
  }

  // STEP 7: Multi-turn conversation
  async conversation(messages, system = null) {
    try {
      const response = await this.anthropic.messages.create({
        model: this.models.sonnet,
        max_tokens: 4096,
        system: system,
        messages: messages  // Array of {role: 'user'|'assistant', content: string}
      });

      return response.content[0].text;
    } catch (error) {
      console.error('❌ Conversation failed:', error.message);
      return null;
    }
  }

  // STEP 8: Streaming response
  async stream(prompt, onChunk) {
    try {
      const stream = await this.anthropic.messages.create({
        model: this.models.sonnet,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      });

      let fullResponse = '';
      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          const chunk = messageStreamEvent.delta.text;
          fullResponse += chunk;
          if (onChunk) onChunk(chunk);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('❌ Stream failed:', error.message);
      return null;
    }
  }

  // STEP 9: Vision - Analyze images
  async analyzeImage(imagePathOrUrl, prompt) {
    try {
      let imageData;
      let mediaType;

      // Handle local file or URL
      if (imagePathOrUrl.startsWith('http')) {
        // Fetch image from URL
        const response = await fetch(imagePathOrUrl);
        const buffer = await response.arrayBuffer();
        imageData = Buffer.from(buffer).toString('base64');
        mediaType = response.headers.get('content-type') || 'image/jpeg';
      } else {
        // Read local file
        const buffer = fs.readFileSync(imagePathOrUrl);
        imageData = buffer.toString('base64');
        const ext = imagePathOrUrl.split('.').pop().toLowerCase();
        mediaType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      }

      const message = await this.anthropic.messages.create({
        model: this.models.sonnet,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageData
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      });

      console.log('👁️ Vision Analysis:', message.content[0].text);
      return message.content[0].text;
    } catch (error) {
      console.error('❌ Vision analysis failed:', error.message);
      return null;
    }
  }

  // STEP 10: Tool use (function calling)
  async useTools(prompt, tools) {
    try {
      const message = await this.anthropic.messages.create({
        model: this.models.sonnet,
        max_tokens: 4096,
        tools: tools,  // Array of tool definitions
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Check if Claude wants to use a tool
      for (const content of message.content) {
        if (content.type === 'tool_use') {
          console.log('🔧 Tool Called:', content.name);
          console.log('📦 Input:', content.input);
          return {
            toolName: content.name,
            toolInput: content.input,
            toolId: content.id
          };
        }
      }

      return message.content[0].text;
    } catch (error) {
      console.error('❌ Tool use failed:', error.message);
      return null;
    }
  }

  // STEP 11: Define tools for Claude
  createTools() {
    return [
      {
        name: 'get_weather',
        description: 'Get the current weather in a location',
        input_schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA'
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'The unit of temperature'
            }
          },
          required: ['location']
        }
      },
      {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        input_schema: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'The mathematical expression to evaluate'
            }
          },
          required: ['expression']
        }
      }
    ];
  }

  // STEP 12: Complex multi-modal content
  async processMultiModal(contents) {
    try {
      const message = await this.anthropic.messages.create({
        model: this.models.sonnet,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: contents  // Array of {type: 'text'|'image', ...}
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('❌ Multi-modal failed:', error.message);
      return null;
    }
  }

  // STEP 13: Generate structured output
  async generateStructured(prompt, schema) {
    const systemPrompt = `You must respond with valid JSON that matches this schema:
${JSON.stringify(schema, null, 2)}

Only output the JSON, no other text.`;

    try {
      const response = await this.complete(prompt, {
        system: systemPrompt,
        temperature: 0.3
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Structured generation failed:', error.message);
      return null;
    }
  }

  // STEP 14: Code generation
  async generateCode(description, language = 'javascript') {
    const prompt = `Generate ${language} code for: ${description}

Requirements:
1. Include detailed comments
2. Follow best practices
3. Handle errors appropriately
4. Make it production-ready

Output only the code, no explanations.`;

    return await this.complete(prompt, {
      temperature: 0.3,
      model: this.models.sonnet
    });
  }

  // STEP 15: Text analysis
  async analyzeText(text, analysisType = 'sentiment') {
    const prompts = {
      sentiment: `Analyze the sentiment of this text. Return JSON with: {sentiment: 'positive'|'negative'|'neutral', confidence: 0-1, summary: string}`,
      summary: `Summarize this text in 3-5 bullet points`,
      entities: `Extract all named entities (people, places, organizations) from this text`,
      keywords: `Extract the top 10 keywords from this text`,
      topics: `Identify the main topics discussed in this text`
    };

    const prompt = `${prompts[analysisType] || prompts.sentiment}

Text: ${text}`;

    return await this.complete(prompt, {
      temperature: 0.3
    });
  }

  // STEP 16: Generate Instagram content (Claude-specific)
  async generateInstagramPost(topic, brand = 'Legacy Wine & Liquor') {
    const prompt = `Create an engaging Instagram post for ${brand} about: ${topic}

Requirements:
1. Caption: 2-3 sentences with emojis, conversational tone
2. Call to action: Clear and compelling
3. Hashtags: 20-25 relevant tags mixing popular and niche
4. Image suggestion: Describe the ideal photo

Format as JSON with keys: caption, cta, hashtags, imageDescription`;

    const response = await this.generateStructured(prompt, {
      caption: 'string',
      cta: 'string',
      hashtags: 'string',
      imageDescription: 'string'
    });

    return response;
  }

  // STEP 17: Creative writing
  async creativeWrite(prompt, style = 'professional') {
    const styles = {
      professional: 'Write in a professional, business-appropriate tone',
      casual: 'Write in a friendly, conversational tone',
      humorous: 'Write with humor and wit',
      poetic: 'Write in a poetic, artistic style',
      technical: 'Write in a precise, technical manner'
    };

    const fullPrompt = `${styles[style] || styles.professional}

${prompt}`;

    return await this.complete(fullPrompt, {
      temperature: 0.8,
      model: this.models.sonnet
    });
  }

  // STEP 18: Compare Claude models
  async compareModels(prompt) {
    console.log('🔬 Comparing Claude models...\n');

    const results = {};

    for (const [name, model] of Object.entries(this.models)) {
      if (name === 'legacy') continue; // Skip legacy model

      console.log(`Testing ${name}...`);
      const start = Date.now();

      try {
        const response = await this.complete(prompt, {
          model: model,
          maxTokens: 500
        });

        results[name] = {
          model: model,
          time: Date.now() - start,
          response: response?.substring(0, 200) + '...',
          success: true
        };
      } catch (error) {
        results[name] = {
          model: model,
          error: error.message,
          success: false
        };
      }
    }

    console.log('\n📊 Results:');
    Object.entries(results).forEach(([name, result]) => {
      if (result.success) {
        console.log(`  ${name}: ${result.time}ms`);
      } else {
        console.log(`  ${name}: Failed - ${result.error}`);
      }
    });

    return results;
  }

  // STEP 19: Translation
  async translate(text, targetLanguage, sourceLanguage = 'auto') {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
Only provide the translation, no explanations.

Text: ${text}`;

    return await this.complete(prompt, {
      temperature: 0.3
    });
  }

  // STEP 20: Q&A with context
  async questionAnswer(question, context) {
    const prompt = `Based on the following context, answer the question accurately and concisely.

Context:
${context}

Question: ${question}

Answer:`;

    return await this.complete(prompt, {
      temperature: 0.5,
      model: this.models.sonnet
    });
  }
}

// STEP 21: Example usage functions
async function examples() {
  const claude = new ClaudeAPI();

  // Basic completion
  const response = await claude.complete('What are the benefits of wine tasting events for a liquor store?');
  console.log('Basic:', response);

  // Generate Instagram content
  const post = await claude.generateInstagramPost('weekend wine specials');
  console.log('Instagram:', post);

  // Analyze sentiment
  const sentiment = await claude.analyzeText('I love shopping at Legacy Wine! Great selection and prices.', 'sentiment');
  console.log('Sentiment:', sentiment);

  // Use tools
  const tools = claude.createTools();
  const toolResponse = await claude.useTools('What\'s the weather in Sanford, FL?', tools);
  console.log('Tool Use:', toolResponse);
}

// STEP 22: Main execution
async function main() {
  console.log('🤖 ANTHROPIC CLAUDE API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', ANTHROPIC_API_KEY?.substring(0, 20) + '...');
  console.log('  Models:', Object.keys(new ClaudeAPI().models).join(', '));
  console.log('');

  const claude = new ClaudeAPI();

  // Test basic completion
  await claude.complete('Explain the benefits of using Claude for business automation in 2 sentences.');

  // Compare models
  // await claude.compareModels('Write a haiku about wine');
}

// STEP 23: Export for use in other files
export default ClaudeAPI;

// STEP 24: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}