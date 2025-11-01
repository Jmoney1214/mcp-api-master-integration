#!/usr/bin/env node
/**
 * OPENAI GPT-4 API INTEGRATION - COMPLETE CONNECTION GUIDE
 * ========================================================
 * Line-by-line guide to OpenAI API for GPT-4, DALL-E, Whisper
 * Text generation, image creation, embeddings, moderation
 */

// STEP 1: Import required packages
import OpenAI from 'openai';                      // Official OpenAI SDK
import fs from 'fs';                              // File system operations
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ORGANIZATION_ID = 'org-sEJFXUb8UkRaOqeKXvwFgYGC';

// STEP 4: Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: ORGANIZATION_ID
});

// STEP 5: OpenAI API class wrapper
class OpenAIAPI {
  constructor() {
    this.openai = openai;
    this.models = {
      chat: 'gpt-4-turbo-preview',       // Latest GPT-4 Turbo
      vision: 'gpt-4-vision-preview',    // GPT-4 with vision
      legacy: 'gpt-3.5-turbo',          // Fast, cheaper option
      dalle: 'dall-e-3',                 // Image generation
      whisper: 'whisper-1',              // Audio transcription
      tts: 'tts-1-hd',                   // Text to speech
      embedding: 'text-embedding-3-large' // Embeddings
    };
  }

  // STEP 6: Basic chat completion
  async chatCompletion(prompt, options = {}) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || this.models.chat,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        response_format: options.responseFormat,  // { type: "json_object" }
        seed: options.seed,                       // For deterministic outputs
        user: options.user                        // User identifier
      });

      const response = completion.choices[0].message.content;
      console.log('💬 GPT-4 Response:', response.substring(0, 200) + '...');
      console.log('📊 Usage:', completion.usage);

      return response;
    } catch (error) {
      console.error('❌ Chat completion failed:', error.message);
      return null;
    }
  }

  // STEP 7: Streaming chat completion
  async streamChat(prompt, onChunk) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.models.chat,
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        if (onChunk) onChunk(content);
      }

      return fullResponse;
    } catch (error) {
      console.error('❌ Stream failed:', error.message);
      return null;
    }
  }

  // STEP 8: Multi-turn conversation
  async conversation(messages) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.models.chat,
        messages: messages,  // Array of {role, content} objects
        temperature: 0.7
      });

      return completion.choices[0].message;
    } catch (error) {
      console.error('❌ Conversation failed:', error.message);
      return null;
    }
  }

  // STEP 9: Function calling
  async functionCall(prompt, functions) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.models.chat,
        messages: [
          { role: 'user', content: prompt }
        ],
        functions: functions,      // Array of function definitions
        function_call: 'auto'      // or specific function name
      });

      const message = completion.choices[0].message;
      if (message.function_call) {
        console.log('📞 Function called:', message.function_call.name);
        console.log('📦 Arguments:', message.function_call.arguments);
      }

      return message;
    } catch (error) {
      console.error('❌ Function call failed:', error.message);
      return null;
    }
  }

  // STEP 10: Vision API - Analyze images
  async analyzeImage(imageUrl, prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.models.vision,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'  // 'low', 'high', or 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      console.log('👁️ Vision Analysis:', response);
      return response;
    } catch (error) {
      console.error('❌ Vision analysis failed:', error.message);
      return null;
    }
  }

  // STEP 11: DALL-E 3 - Generate images
  async generateImage(prompt, options = {}) {
    try {
      const response = await this.openai.images.generate({
        model: this.models.dalle,
        prompt: prompt,
        n: options.n || 1,                    // Number of images
        size: options.size || '1024x1024',    // 1024x1024, 1792x1024, 1024x1792
        quality: options.quality || 'standard', // 'standard' or 'hd'
        style: options.style || 'vivid',      // 'vivid' or 'natural'
        response_format: options.format || 'url', // 'url' or 'b64_json'
        user: options.user
      });

      console.log('🎨 Image Generated:');
      response.data.forEach((img, idx) => {
        console.log(`  Image ${idx + 1}: ${img.url}`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
      return null;
    }
  }

  // STEP 12: Image variations
  async createImageVariation(imagePath, n = 1) {
    try {
      const response = await this.openai.images.createVariation({
        image: fs.createReadStream(imagePath),
        n: n,
        size: '1024x1024'
      });

      console.log('🎨 Variations created:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Variation failed:', error.message);
      return null;
    }
  }

  // STEP 13: Edit image with DALL-E
  async editImage(imagePath, maskPath, prompt) {
    try {
      const response = await this.openai.images.edit({
        image: fs.createReadStream(imagePath),
        mask: fs.createReadStream(maskPath),
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });

      console.log('✏️ Image edited:', response.data[0].url);
      return response.data;
    } catch (error) {
      console.error('❌ Edit failed:', error.message);
      return null;
    }
  }

  // STEP 14: Whisper - Transcribe audio
  async transcribeAudio(audioPath, options = {}) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: this.models.whisper,
        language: options.language,           // Optional language code
        prompt: options.prompt,               // Optional context
        response_format: options.format || 'json', // json, text, srt, vtt
        temperature: options.temperature || 0
      });

      console.log('🎤 Transcription:', transcription.text);
      return transcription;
    } catch (error) {
      console.error('❌ Transcription failed:', error.message);
      return null;
    }
  }

  // STEP 15: Whisper - Translate audio
  async translateAudio(audioPath) {
    try {
      const translation = await this.openai.audio.translations.create({
        file: fs.createReadStream(audioPath),
        model: this.models.whisper
      });

      console.log('🌐 Translation:', translation.text);
      return translation;
    } catch (error) {
      console.error('❌ Translation failed:', error.message);
      return null;
    }
  }

  // STEP 16: Text to Speech
  async textToSpeech(text, options = {}) {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: options.model || this.models.tts,
        voice: options.voice || 'nova',       // alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: options.speed || 1.0           // 0.25 to 4.0
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const outputPath = options.outputPath || 'output.mp3';
      fs.writeFileSync(outputPath, buffer);

      console.log('🔊 Audio saved to:', outputPath);
      return outputPath;
    } catch (error) {
      console.error('❌ TTS failed:', error.message);
      return null;
    }
  }

  // STEP 17: Create embeddings
  async createEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.models.embedding,
        input: text,
        encoding_format: 'float'  // or 'base64'
      });

      console.log('📐 Embedding created:', response.data[0].embedding.length, 'dimensions');
      console.log('📊 Usage:', response.usage);
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Embedding failed:', error.message);
      return null;
    }
  }

  // STEP 18: Moderation check
  async moderate(text) {
    try {
      const response = await this.openai.moderations.create({
        input: text
      });

      const result = response.results[0];
      console.log('🛡️ Moderation Results:');
      console.log('  Flagged:', result.flagged);
      if (result.flagged) {
        console.log('  Categories:', Object.keys(result.categories).filter(k => result.categories[k]));
      }

      return result;
    } catch (error) {
      console.error('❌ Moderation failed:', error.message);
      return null;
    }
  }

  // STEP 19: List available models
  async listModels() {
    try {
      const response = await this.openai.models.list();

      console.log('🤖 Available Models:');
      const gptModels = response.data.filter(m => m.id.includes('gpt'));
      gptModels.forEach(model => {
        console.log(`  ${model.id} (${model.owned_by})`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ List models failed:', error.message);
      return [];
    }
  }

  // STEP 20: Fine-tuning job
  async createFineTune(trainingFile, options = {}) {
    try {
      const response = await this.openai.fineTuning.jobs.create({
        training_file: trainingFile,
        model: options.model || 'gpt-3.5-turbo',
        hyperparameters: {
          n_epochs: options.epochs || 3
        },
        suffix: options.suffix,
        validation_file: options.validationFile
      });

      console.log('🎓 Fine-tune job created:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Fine-tune failed:', error.message);
      return null;
    }
  }

  // STEP 21: Generate Instagram content
  async generateInstagramPost(topic, brand = 'Legacy Wine & Liquor') {
    const prompt = `Create an engaging Instagram post for ${brand} about: ${topic}

Include:
1. A catchy caption (2-3 sentences) with emojis
2. A clear call-to-action
3. 20-25 relevant hashtags
4. Suggest the type of image to use

Format the response as JSON with keys: caption, cta, hashtags, imageDescription`;

    const response = await this.chatCompletion(prompt, {
      responseFormat: { type: 'json_object' },
      temperature: 0.8
    });

    return JSON.parse(response);
  }

  // STEP 22: Generate product descriptions
  async generateProductDescription(product, features) {
    const prompt = `Write a compelling product description for:
Product: ${product}
Features: ${features}

Include:
- Engaging opening hook
- Key benefits and features
- Sensory details
- Ideal occasions or pairings
- Call to action

Keep it between 100-150 words, professional yet approachable.`;

    return await this.chatCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 300
    });
  }

  // STEP 23: Analyze customer sentiment
  async analyzeSentiment(reviews) {
    const prompt = `Analyze the sentiment of these customer reviews and provide insights:

${reviews.join('\n\n')}

Provide:
1. Overall sentiment (positive/neutral/negative)
2. Key positive themes
3. Key concerns or complaints
4. Suggested improvements
5. Response templates for common issues`;

    return await this.chatCompletion(prompt, {
      temperature: 0.3
    });
  }
}

// STEP 24: Example usage patterns
async function examples() {
  const ai = new OpenAIAPI();

  // Instagram content generation
  const post = await ai.generateInstagramPost('weekend wine specials');
  console.log('Instagram Post:', post);

  // Product description
  const description = await ai.generateProductDescription(
    'Château Margaux 2016',
    'Premier Grand Cru Classé, Bordeaux, 97 points'
  );
  console.log('Product Description:', description);

  // Image generation for social media
  const images = await ai.generateImage(
    'An elegant wine tasting setup with red wine glasses, cheese board, and grapes, professional photography style',
    { quality: 'hd', style: 'natural' }
  );
}

// STEP 25: Main execution
async function main() {
  console.log('🤖 OPENAI GPT-4 API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', OPENAI_API_KEY?.substring(0, 20) + '...');
  console.log('  Organization:', ORGANIZATION_ID);
  console.log('');

  const ai = new OpenAIAPI();

  // Test basic completion
  await ai.chatCompletion('What are the top wine trends for 2025?');

  // List available models
  await ai.listModels();
}

// STEP 26: Export for use in other files
export default OpenAIAPI;

// STEP 27: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}