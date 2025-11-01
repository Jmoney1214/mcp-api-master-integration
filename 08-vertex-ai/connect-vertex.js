#!/usr/bin/env node
/**
 * GOOGLE VERTEX AI - COMPLETE CONNECTION GUIDE
 * ============================================
 * Line-by-line guide to Vertex AI (Gemini Pro, Vision, PaLM)
 * Multi-modal AI, embeddings, custom models
 */

// STEP 1: Import required packages
import { VertexAI } from '@google-cloud/vertexai';  // Vertex AI SDK
import { GoogleAuth } from 'google-auth-library';    // Authentication
import axios from 'axios';                           // HTTP client
import dotenv from 'dotenv';                         // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration (Your provided credentials)
const VERTEX_API_KEY = 'AQ.Ab8RN6IDhxgXCyNvItIhVLMTcF1pL3u2QBv9jj0ZnuEQ8AGsaA';
const VERTEX_SERVICE_ACCOUNT = 'vertex-express@fast-envoy-407820.iam.gserviceaccount.com';
const VERTEX_PROJECT_ID = 'fast-envoy-407820';
const VERTEX_LOCATION = 'us-central1';

// STEP 4: Initialize Vertex AI client
const vertexAI = new VertexAI({
  project: VERTEX_PROJECT_ID,
  location: VERTEX_LOCATION
});

// STEP 5: Vertex AI class wrapper
class VertexAPI {
  constructor() {
    this.vertexAI = vertexAI;
    this.projectId = VERTEX_PROJECT_ID;
    this.location = VERTEX_LOCATION;
    this.models = {
      geminiPro: 'gemini-1.5-pro-preview-0409',     // Latest Gemini Pro
      geminiFlash: 'gemini-1.5-flash',              // Fast, efficient
      geminiProVision: 'gemini-1.5-pro-vision',     // Vision capabilities
      palm: 'text-bison',                           // PaLM 2 for text
      chat: 'chat-bison',                           // PaLM 2 for chat
      code: 'code-bison',                           // Code generation
      codechat: 'codechat-bison',                   // Code chat
      embedding: 'textembedding-gecko'              // Text embeddings
    };
  }

  // STEP 6: Get Gemini model
  getGenerativeModel(modelName = 'gemini-1.5-pro-preview-0409') {
    return this.vertexAI.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.9,
        topP: 1,
        topK: 32
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });
  }

  // STEP 7: Generate text with Gemini
  async generateText(prompt, options = {}) {
    try {
      const model = this.getGenerativeModel(options.model || this.models.geminiPro);

      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.9,
          topK: options.topK || 32,
          topP: options.topP || 1,
          maxOutputTokens: options.maxTokens || 4096,
          stopSequences: options.stopSequences
        }
      };

      const result = await model.generateContent(request);
      const response = result.response;

      console.log('💬 Gemini Response:', response.candidates[0].content.parts[0].text.substring(0, 200) + '...');
      console.log('📊 Usage:', {
        promptTokens: response.usageMetadata?.promptTokenCount,
        candidateTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount
      });

      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      return null;
    }
  }

  // STEP 8: Multi-turn chat with Gemini
  async startChat(systemInstruction = null) {
    const model = this.getGenerativeModel();

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.9
      }
    });

    return {
      sendMessage: async (message) => {
        const result = await chat.sendMessage(message);
        return result.response.candidates[0].content.parts[0].text;
      },
      getHistory: () => chat.getHistory()
    };
  }

  // STEP 9: Stream response
  async streamGenerate(prompt, onChunk) {
    try {
      const model = this.getGenerativeModel();

      const request = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      const streamingResult = await model.generateContentStream(request);

      let fullResponse = '';
      for await (const chunk of streamingResult.stream) {
        const chunkText = chunk.candidates[0].content.parts[0].text;
        fullResponse += chunkText;
        if (onChunk) onChunk(chunkText);
      }

      return fullResponse;
    } catch (error) {
      console.error('❌ Stream failed:', error.message);
      return null;
    }
  }

  // STEP 10: Vision analysis with Gemini
  async analyzeImage(imageUrl, prompt) {
    try {
      const model = this.getGenerativeModel(this.models.geminiProVision);

      // Fetch image data
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                inlineData: {
                  mimeType: imageResponse.headers['content-type'] || 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ]
      };

      const result = await model.generateContent(request);
      const response = result.response.candidates[0].content.parts[0].text;

      console.log('👁️ Vision Analysis:', response);
      return response;
    } catch (error) {
      console.error('❌ Vision analysis failed:', error.message);
      return null;
    }
  }

  // STEP 11: Analyze video
  async analyzeVideo(videoUrl, prompt) {
    try {
      const model = this.getGenerativeModel(this.models.geminiProVision);

      // For video, we need to provide it as a GCS URL or base64
      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                fileData: {
                  mimeType: 'video/mp4',
                  fileUri: videoUrl  // Must be a GCS URL
                }
              }
            ]
          }
        ]
      };

      const result = await model.generateContent(request);
      return result.response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Video analysis failed:', error.message);
      return null;
    }
  }

  // STEP 12: Multi-modal content
  async processMultiModal(contents) {
    try {
      const model = this.getGenerativeModel(this.models.geminiProVision);

      const request = {
        contents: [
          {
            role: 'user',
            parts: contents  // Array of text, image, video parts
          }
        ]
      };

      const result = await model.generateContent(request);
      return result.response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Multi-modal failed:', error.message);
      return null;
    }
  }

  // STEP 13: Generate embeddings
  async generateEmbedding(text) {
    try {
      const model = this.vertexAI.preview.getGenerativeModel({
        model: this.models.embedding
      });

      const request = {
        content: {
          parts: [{ text: text }]
        }
      };

      const result = await model.embedContent(request);
      const embedding = result.embedding.values;

      console.log('📐 Embedding generated:', embedding.length, 'dimensions');
      return embedding;
    } catch (error) {
      console.error('❌ Embedding failed:', error.message);
      return null;
    }
  }

  // STEP 14: Code generation
  async generateCode(description, language = 'javascript') {
    try {
      const model = this.getGenerativeModel(this.models.code);

      const prompt = `Generate ${language} code for: ${description}

Requirements:
1. Include comments
2. Follow best practices
3. Handle errors
4. Make it production-ready

Output only the code:`;

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });

      return result.response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Code generation failed:', error.message);
      return null;
    }
  }

  // STEP 15: Count tokens
  async countTokens(text) {
    try {
      const model = this.getGenerativeModel();

      const request = {
        contents: [
          {
            role: 'user',
            parts: [{ text: text }]
          }
        ]
      };

      const countResult = await model.countTokens(request);

      console.log('🔢 Token Count:', countResult.totalTokens);
      return countResult.totalTokens;
    } catch (error) {
      console.error('❌ Token count failed:', error.message);
      return null;
    }
  }

  // STEP 16: Generate Instagram content
  async generateInstagramPost(topic, brand = 'Legacy Wine & Liquor') {
    const prompt = `Create an engaging Instagram post for ${brand} about: ${topic}

Include:
1. Caption: 2-3 sentences with emojis, make it engaging
2. Call to action: Clear and compelling
3. Hashtags: 20-25 relevant hashtags
4. Image description: What type of photo would work best

Format as JSON with keys: caption, cta, hashtags, imageDescription`;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 1000
      });

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.error('❌ Instagram generation failed:', error.message);
      return null;
    }
  }

  // STEP 17: Analyze sentiment
  async analyzeSentiment(text) {
    const prompt = `Analyze the sentiment of this text:
"${text}"

Return a JSON object with:
- sentiment: "positive", "negative", or "neutral"
- confidence: 0-1 score
- summary: brief explanation`;

    const response = await this.generateText(prompt, {
      temperature: 0.3
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch {
      return response;
    }
  }

  // STEP 18: Translate text
  async translate(text, targetLanguage, sourceLanguage = 'auto') {
    const prompt = `Translate from ${sourceLanguage} to ${targetLanguage}:
"${text}"

Only provide the translation, no explanations.`;

    return await this.generateText(prompt, {
      temperature: 0.3
    });
  }

  // STEP 19: Summarize text
  async summarize(text, style = 'bullets') {
    const styles = {
      bullets: 'Summarize in 3-5 bullet points',
      paragraph: 'Summarize in one paragraph',
      tldr: 'Provide a TL;DR in one sentence',
      executive: 'Provide an executive summary'
    };

    const prompt = `${styles[style] || styles.bullets}:

${text}`;

    return await this.generateText(prompt, {
      temperature: 0.5
    });
  }

  // STEP 20: Compare with other AI models
  async compareWithOthers(prompt) {
    console.log('🔬 Testing Gemini models...\n');

    const models = [
      this.models.geminiPro,
      this.models.geminiFlash
    ];

    const results = {};

    for (const model of models) {
      console.log(`Testing ${model}...`);
      const start = Date.now();

      try {
        const response = await this.generateText(prompt, {
          model: model,
          maxTokens: 500
        });

        results[model] = {
          time: Date.now() - start,
          response: response?.substring(0, 200) + '...',
          success: true
        };
      } catch (error) {
        results[model] = {
          error: error.message,
          success: false
        };
      }
    }

    return results;
  }

  // STEP 21: Function calling
  async callFunction(prompt, functions) {
    const functionDeclarations = functions.map(f => ({
      name: f.name,
      description: f.description,
      parameters: f.parameters
    }));

    const model = this.vertexAI.preview.getGenerativeModel({
      model: this.models.geminiPro,
      tools: [
        {
          functionDeclarations: functionDeclarations
        }
      ]
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const functionCall = result.response.candidates[0].content.parts[0].functionCall;
    if (functionCall) {
      console.log('🔧 Function called:', functionCall.name);
      console.log('📦 Arguments:', functionCall.args);
      return functionCall;
    }

    return result.response.candidates[0].content.parts[0].text;
  }
}

// STEP 22: Example usage
async function examples() {
  const vertex = new VertexAPI();

  // Generate text
  const text = await vertex.generateText('What are the benefits of wine clubs for liquor stores?');
  console.log('Text:', text);

  // Generate Instagram post
  const post = await vertex.generateInstagramPost('weekend bourbon tasting event');
  console.log('Instagram:', post);

  // Analyze sentiment
  const sentiment = await vertex.analyzeSentiment('The wine selection at Legacy is amazing!');
  console.log('Sentiment:', sentiment);

  // Count tokens
  await vertex.countTokens('This is a test string to count tokens.');
}

// STEP 23: Main execution
async function main() {
  console.log('🌟 GOOGLE VERTEX AI CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  API Key:', VERTEX_API_KEY?.substring(0, 20) + '...');
  console.log('  Project:', VERTEX_PROJECT_ID);
  console.log('  Service Account:', VERTEX_SERVICE_ACCOUNT);
  console.log('  Location:', VERTEX_LOCATION);
  console.log('');

  const vertex = new VertexAPI();

  // Test basic generation
  await vertex.generateText('Explain Vertex AI in one sentence.');
}

// STEP 24: Export for use in other files
export default VertexAPI;

// STEP 25: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}