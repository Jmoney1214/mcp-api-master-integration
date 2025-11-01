#!/usr/bin/env node
/**
 * INSTAGRAM GRAPH API - COMPLETE CONNECTION GUIDE
 * ===============================================
 * Line-by-line guide to Instagram Business API
 * Post content, manage comments, analytics, insights
 */

// STEP 1: Import required packages
import axios from 'axios';                        // HTTP client
import FormData from 'form-data';                 // For multipart uploads
import fs from 'fs';                              // File system
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || 'EAAOgrhO0oCoBO2kQkA9WoUzP1K5uMQ6sZA6c7MmddZCj8UyEVpFKYHo6DJiFZCCLCvGQQa9c9lXvNnwvs0p7LwS3XhRO6hmuJ4Jn6YzUvPLLIY5BZBq8ZCh3l03pZBLZCBykJnUfL8MRLiKoAZBoZCZBXBjbZBnIzqnVLUL6EwGm9TdFiZAmN1EMTB9cAbgCT4LsL5aUJ';
const INSTAGRAM_PAGE_ID = '17841463539272316';
const FACEBOOK_PAGE_ID = '441800279330152';
const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

// STEP 4: Instagram API class
class InstagramAPI {
  constructor() {
    this.accessToken = INSTAGRAM_ACCESS_TOKEN;
    this.igAccountId = INSTAGRAM_PAGE_ID;
    this.fbPageId = FACEBOOK_PAGE_ID;
    this.apiBase = GRAPH_API_BASE;
  }

  // STEP 5: Get Instagram Business Account info
  async getAccountInfo() {
    try {
      const response = await axios.get(
        `${this.apiBase}/${this.igAccountId}`,
        {
          params: {
            fields: 'biography,followers_count,follows_count,media_count,profile_picture_url,username,website',
            access_token: this.accessToken
          }
        }
      );

      console.log('📱 Instagram Account Info:');
      console.log('  Username:', response.data.username);
      console.log('  Followers:', response.data.followers_count);
      console.log('  Following:', response.data.follows_count);
      console.log('  Posts:', response.data.media_count);
      console.log('  Bio:', response.data.biography);

      return response.data;
    } catch (error) {
      console.error('❌ Get account failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 6: Create a single image post
  async createImagePost(imageUrl, caption) {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken
        }
      );

      const creationId = containerResponse.data.id;
      console.log('📦 Media container created:', creationId);

      // Step 2: Wait for processing
      await this.waitForMediaProcessing(creationId);

      // Step 3: Publish the post
      const publishResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken
        }
      );

      console.log('✅ Post published:', publishResponse.data.id);
      return publishResponse.data;
    } catch (error) {
      console.error('❌ Create post failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 7: Create video post
  async createVideoPost(videoUrl, caption, thumbnailUrl = null) {
    try {
      const params = {
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: caption,
        access_token: this.accessToken
      };

      if (thumbnailUrl) {
        params.thumb_offset = 0;
        params.thumbnail_url = thumbnailUrl;
      }

      // Create video container
      const containerResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media`,
        params
      );

      const creationId = containerResponse.data.id;
      console.log('🎥 Video container created:', creationId);

      // Wait for processing (videos take longer)
      await this.waitForMediaProcessing(creationId, 60);

      // Publish
      const publishResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken
        }
      );

      console.log('✅ Video published:', publishResponse.data.id);
      return publishResponse.data;
    } catch (error) {
      console.error('❌ Video post failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 8: Create carousel post (multiple images)
  async createCarouselPost(mediaItems, caption) {
    try {
      // Step 1: Create containers for each item
      const containerIds = [];

      for (const item of mediaItems) {
        const params = {
          access_token: this.accessToken
        };

        if (item.type === 'IMAGE') {
          params.image_url = item.url;
          params.is_carousel_item = true;
        } else if (item.type === 'VIDEO') {
          params.media_type = 'VIDEO';
          params.video_url = item.url;
          params.is_carousel_item = true;
        }

        const response = await axios.post(
          `${this.apiBase}/${this.igAccountId}/media`,
          params
        );

        containerIds.push(response.data.id);
        console.log(`📦 Carousel item ${containerIds.length} created`);
      }

      // Step 2: Create carousel container
      const carouselResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
          caption: caption,
          access_token: this.accessToken
        }
      );

      const carouselId = carouselResponse.data.id;
      console.log('🎠 Carousel container created:', carouselId);

      // Step 3: Wait and publish
      await this.waitForMediaProcessing(carouselId);

      const publishResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media_publish`,
        {
          creation_id: carouselId,
          access_token: this.accessToken
        }
      );

      console.log('✅ Carousel published:', publishResponse.data.id);
      return publishResponse.data;
    } catch (error) {
      console.error('❌ Carousel failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 9: Create Reel
  async createReel(videoUrl, caption, coverUrl = null, audioName = null) {
    try {
      const params = {
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        share_to_feed: true,          // Also share to main feed
        access_token: this.accessToken
      };

      if (coverUrl) {
        params.cover_url = coverUrl;
      }

      if (audioName) {
        params.audio_name = audioName;
      }

      // Create reel container
      const containerResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media`,
        params
      );

      const creationId = containerResponse.data.id;
      console.log('🎬 Reel container created:', creationId);

      // Wait for processing
      await this.waitForMediaProcessing(creationId, 90);

      // Publish
      const publishResponse = await axios.post(
        `${this.apiBase}/${this.igAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken
        }
      );

      console.log('✅ Reel published:', publishResponse.data.id);
      return publishResponse.data;
    } catch (error) {
      console.error('❌ Reel failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 10: Get recent media
  async getRecentMedia(limit = 10) {
    try {
      const response = await axios.get(
        `${this.apiBase}/${this.igAccountId}/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            limit: limit,
            access_token: this.accessToken
          }
        }
      );

      console.log('📸 Recent Posts:');
      response.data.data.forEach(post => {
        console.log(`  ${post.media_type}: ${post.caption?.substring(0, 50)}...`);
        console.log(`    Likes: ${post.like_count}, Comments: ${post.comments_count}`);
        console.log(`    Link: ${post.permalink}`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Get media failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 11: Get media insights
  async getMediaInsights(mediaId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/${mediaId}/insights`,
        {
          params: {
            metric: 'impressions,reach,engagement,saved,video_views,shares',
            access_token: this.accessToken
          }
        }
      );

      console.log('📊 Media Insights:');
      response.data.data.forEach(metric => {
        console.log(`  ${metric.name}: ${metric.values[0].value}`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Get insights failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 12: Get account insights
  async getAccountInsights(period = 'day', since = null, until = null) {
    try {
      const params = {
        metric: 'impressions,reach,profile_views,follower_count,email_contacts,phone_call_clicks,text_message_clicks,website_clicks',
        period: period,  // day, week, days_28, lifetime
        access_token: this.accessToken
      };

      if (since) params.since = since;
      if (until) params.until = until;

      const response = await axios.get(
        `${this.apiBase}/${this.igAccountId}/insights`,
        params
      );

      console.log(`📈 Account Insights (${period}):`);
      response.data.data.forEach(metric => {
        console.log(`  ${metric.name}: ${metric.values[0].value}`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Account insights failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 13: Get comments on a post
  async getComments(mediaId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,text,username,timestamp,like_count',
            access_token: this.accessToken
          }
        }
      );

      console.log('💬 Comments:');
      response.data.data.forEach(comment => {
        console.log(`  @${comment.username}: ${comment.text}`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Get comments failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 14: Reply to comment
  async replyToComment(commentId, message) {
    try {
      const response = await axios.post(
        `${this.apiBase}/${commentId}/replies`,
        {
          message: message,
          access_token: this.accessToken
        }
      );

      console.log('✅ Reply posted:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Reply failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 15: Delete comment
  async deleteComment(commentId) {
    try {
      await axios.delete(
        `${this.apiBase}/${commentId}`,
        {
          params: {
            access_token: this.accessToken
          }
        }
      );

      console.log('✅ Comment deleted');
      return true;
    } catch (error) {
      console.error('❌ Delete comment failed:', error.response?.data || error.message);
      return false;
    }
  }

  // STEP 16: Get hashtag info
  async getHashtagInfo(hashtagId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/${hashtagId}`,
        {
          params: {
            fields: 'id,name',
            access_token: this.accessToken
          }
        }
      );

      console.log('🏷️ Hashtag:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('❌ Get hashtag failed:', error.response?.data || error.message);
      return null;
    }
  }

  // STEP 17: Search hashtags
  async searchHashtag(query) {
    try {
      const response = await axios.get(
        `${this.apiBase}/ig_hashtag_search`,
        {
          params: {
            user_id: this.igAccountId,
            q: query,
            access_token: this.accessToken
          }
        }
      );

      console.log('🔍 Hashtag search results:');
      response.data.data.forEach(tag => {
        console.log(`  ${tag.name} (${tag.id})`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Search failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 18: Get top media for hashtag
  async getHashtagTopMedia(hashtagId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/${hashtagId}/top_media`,
        {
          params: {
            user_id: this.igAccountId,
            fields: 'id,caption,media_type,media_url,permalink',
            access_token: this.accessToken
          }
        }
      );

      console.log('🔝 Top posts for hashtag:');
      response.data.data.forEach(post => {
        console.log(`  ${post.caption?.substring(0, 50)}...`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Get top media failed:', error.response?.data || error.message);
      return [];
    }
  }

  // STEP 19: Helper - Wait for media processing
  async waitForMediaProcessing(containerId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(
        `${this.apiBase}/${containerId}`,
        {
          params: {
            fields: 'status_code',
            access_token: this.accessToken
          }
        }
      );

      if (response.data.status_code === 'FINISHED') {
        console.log('✅ Media ready for publishing');
        return true;
      } else if (response.data.status_code === 'ERROR') {
        throw new Error('Media processing failed');
      }

      console.log(`⏳ Processing... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Media processing timeout');
  }

  // STEP 20: Schedule post (requires FB Page)
  async schedulePost(imageUrl, caption, scheduledTime) {
    try {
      const response = await axios.post(
        `${this.apiBase}/${this.fbPageId}/feed`,
        {
          message: caption,
          link: imageUrl,
          published: false,
          scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
          access_token: this.accessToken
        }
      );

      console.log('📅 Post scheduled for:', scheduledTime);
      return response.data;
    } catch (error) {
      console.error('❌ Schedule failed:', error.response?.data || error.message);
      return null;
    }
  }
}

// STEP 21: Main execution
async function main() {
  console.log('📸 INSTAGRAM API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  Access Token:', INSTAGRAM_ACCESS_TOKEN?.substring(0, 20) + '...');
  console.log('  Instagram ID:', INSTAGRAM_PAGE_ID);
  console.log('  Facebook Page:', FACEBOOK_PAGE_ID);
  console.log('');

  const ig = new InstagramAPI();

  // Test various operations
  await ig.getAccountInfo();
  await ig.getRecentMedia(5);
  // await ig.getAccountInsights('day');
}

// STEP 22: Export for use in other files
export default InstagramAPI;

// STEP 23: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}