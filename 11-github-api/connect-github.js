#!/usr/bin/env node
/**
 * GITHUB API - COMPLETE CONNECTION GUIDE
 * ======================================
 * Line-by-line guide to GitHub API v4 (GraphQL) and REST
 * Repositories, issues, PRs, actions, releases
 */

// STEP 1: Import required packages
import { Octokit } from '@octokit/rest';          // GitHub REST API
import { graphql } from '@octokit/graphql';       // GitHub GraphQL API
import dotenv from 'dotenv';                      // Environment variables

// STEP 2: Load environment variables
dotenv.config({ path: '../configs/.env' });

// STEP 3: Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_yBhjJu0efDCMhGwqnEt1oGFBOo8HOY3lxfvY';
const GITHUB_OWNER = 'justinetwaru';  // Your GitHub username
const GITHUB_REPO = 'legacy-wine-app';  // Default repo

// STEP 4: Initialize GitHub clients
const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`
  }
});

// STEP 5: GitHub API class wrapper
class GitHubAPI {
  constructor() {
    this.octokit = octokit;
    this.graphql = graphqlWithAuth;
    this.owner = GITHUB_OWNER;
    this.repo = GITHUB_REPO;
  }

  // STEP 6: Get user information
  async getUserInfo() {
    try {
      const { data } = await this.octokit.users.getAuthenticated();

      console.log('👤 GitHub User:');
      console.log('  Username:', data.login);
      console.log('  Name:', data.name);
      console.log('  Email:', data.email);
      console.log('  Public Repos:', data.public_repos);
      console.log('  Followers:', data.followers);

      return data;
    } catch (error) {
      console.error('❌ Get user failed:', error.message);
      return null;
    }
  }

  // STEP 7: List repositories
  async listRepos(options = {}) {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        type: options.type || 'owner',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.limit || 30
      });

      console.log('📚 Repositories:');
      data.forEach(repo => {
        console.log(`  ${repo.full_name}`);
        console.log(`    ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}`);
        console.log(`    Language: ${repo.language || 'N/A'}`);
      });

      return data;
    } catch (error) {
      console.error('❌ List repos failed:', error.message);
      return [];
    }
  }

  // STEP 8: Create repository
  async createRepo(name, options = {}) {
    try {
      const { data } = await this.octokit.repos.createForAuthenticatedUser({
        name: name,
        description: options.description,
        private: options.private || false,
        auto_init: options.autoInit || true,
        gitignore_template: options.gitignore || 'Node',
        license_template: options.license || 'mit'
      });

      console.log('✅ Repository created:', data.html_url);
      return data;
    } catch (error) {
      console.error('❌ Create repo failed:', error.message);
      return null;
    }
  }

  // STEP 9: Get repository details
  async getRepo(owner = this.owner, repo = this.repo) {
    try {
      const { data } = await this.octokit.repos.get({
        owner: owner,
        repo: repo
      });

      console.log('📦 Repository Details:');
      console.log('  Name:', data.full_name);
      console.log('  Description:', data.description);
      console.log('  Stars:', data.stargazers_count);
      console.log('  Forks:', data.forks_count);
      console.log('  Issues:', data.open_issues_count);

      return data;
    } catch (error) {
      console.error('❌ Get repo failed:', error.message);
      return null;
    }
  }

  // STEP 10: Create issue
  async createIssue(title, body, options = {}) {
    try {
      const { data } = await this.octokit.issues.create({
        owner: this.owner,
        repo: options.repo || this.repo,
        title: title,
        body: body,
        labels: options.labels || [],
        assignees: options.assignees || [],
        milestone: options.milestone
      });

      console.log('✅ Issue created:', data.html_url);
      return data;
    } catch (error) {
      console.error('❌ Create issue failed:', error.message);
      return null;
    }
  }

  // STEP 11: List issues
  async listIssues(options = {}) {
    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: options.repo || this.repo,
        state: options.state || 'open',
        labels: options.labels,
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.limit || 30
      });

      console.log('🐛 Issues:');
      data.forEach(issue => {
        console.log(`  #${issue.number}: ${issue.title}`);
        console.log(`    State: ${issue.state} | Comments: ${issue.comments}`);
      });

      return data;
    } catch (error) {
      console.error('❌ List issues failed:', error.message);
      return [];
    }
  }

  // STEP 12: Create pull request
  async createPullRequest(title, head, base, body) {
    try {
      const { data } = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title: title,
        head: head,  // Branch to merge from
        base: base || 'main',  // Branch to merge into
        body: body,
        draft: false
      });

      console.log('✅ PR created:', data.html_url);
      return data;
    } catch (error) {
      console.error('❌ Create PR failed:', error.message);
      return null;
    }
  }

  // STEP 13: List pull requests
  async listPullRequests(options = {}) {
    try {
      const { data } = await this.octokit.pulls.list({
        owner: this.owner,
        repo: options.repo || this.repo,
        state: options.state || 'open',
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.limit || 30
      });

      console.log('🔀 Pull Requests:');
      data.forEach(pr => {
        console.log(`  #${pr.number}: ${pr.title}`);
        console.log(`    ${pr.head.ref} → ${pr.base.ref}`);
      });

      return data;
    } catch (error) {
      console.error('❌ List PRs failed:', error.message);
      return [];
    }
  }

  // STEP 14: Create/update file
  async createOrUpdateFile(path, content, message, options = {}) {
    try {
      // Check if file exists
      let sha;
      try {
        const { data: existingFile } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: options.repo || this.repo,
          path: path
        });
        sha = existingFile.sha;
      } catch (e) {
        // File doesn't exist, will create new
      }

      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: options.repo || this.repo,
        path: path,
        message: message,
        content: Buffer.from(content).toString('base64'),
        sha: sha,  // Required for updates
        branch: options.branch
      });

      console.log('✅ File saved:', data.content.html_url);
      return data;
    } catch (error) {
      console.error('❌ File operation failed:', error.message);
      return null;
    }
  }

  // STEP 15: Get file content
  async getFile(path, options = {}) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: options.repo || this.repo,
        path: path,
        ref: options.ref || 'main'
      });

      const content = Buffer.from(data.content, 'base64').toString();
      console.log('📄 File content retrieved');
      return content;
    } catch (error) {
      console.error('❌ Get file failed:', error.message);
      return null;
    }
  }

  // STEP 16: Create release
  async createRelease(tagName, name, body, options = {}) {
    try {
      const { data } = await this.octokit.repos.createRelease({
        owner: this.owner,
        repo: options.repo || this.repo,
        tag_name: tagName,
        name: name,
        body: body,
        draft: options.draft || false,
        prerelease: options.prerelease || false,
        generate_release_notes: options.generateNotes || true
      });

      console.log('✅ Release created:', data.html_url);
      return data;
    } catch (error) {
      console.error('❌ Create release failed:', error.message);
      return null;
    }
  }

  // STEP 17: List workflow runs
  async listWorkflowRuns(options = {}) {
    try {
      const { data } = await this.octokit.actions.listWorkflowRunsForRepo({
        owner: this.owner,
        repo: options.repo || this.repo,
        per_page: options.limit || 20
      });

      console.log('🔄 Workflow Runs:');
      data.workflow_runs.forEach(run => {
        console.log(`  ${run.name}: ${run.status} (${run.conclusion})`);
        console.log(`    Started: ${run.created_at}`);
      });

      return data.workflow_runs;
    } catch (error) {
      console.error('❌ List workflows failed:', error.message);
      return [];
    }
  }

  // STEP 18: Search code
  async searchCode(query, options = {}) {
    try {
      const { data } = await this.octokit.search.code({
        q: `${query} user:${this.owner}`,
        sort: options.sort,
        order: options.order || 'desc',
        per_page: options.limit || 30
      });

      console.log(`🔍 Found ${data.total_count} code results`);
      data.items.forEach(item => {
        console.log(`  ${item.repository.name}/${item.path}`);
      });

      return data.items;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      return [];
    }
  }

  // STEP 19: GraphQL query example
  async getRepoStats(owner = this.owner, repo = this.repo) {
    try {
      const query = `
        query($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            name
            stargazerCount
            forkCount
            issues(states: OPEN) {
              totalCount
            }
            pullRequests(states: OPEN) {
              totalCount
            }
            releases(last: 1) {
              nodes {
                tagName
                createdAt
              }
            }
          }
        }
      `;

      const result = await this.graphql(query, {
        owner: owner,
        repo: repo
      });

      console.log('📊 Repository Stats:');
      console.log('  Stars:', result.repository.stargazerCount);
      console.log('  Forks:', result.repository.forkCount);
      console.log('  Open Issues:', result.repository.issues.totalCount);
      console.log('  Open PRs:', result.repository.pullRequests.totalCount);

      return result.repository;
    } catch (error) {
      console.error('❌ GraphQL query failed:', error.message);
      return null;
    }
  }

  // STEP 20: Create GitHub Gist
  async createGist(description, files, isPublic = true) {
    try {
      const { data } = await this.octokit.gists.create({
        description: description,
        public: isPublic,
        files: files  // { "filename.txt": { content: "File content" } }
      });

      console.log('✅ Gist created:', data.html_url);
      return data;
    } catch (error) {
      console.error('❌ Create gist failed:', error.message);
      return null;
    }
  }
}

// STEP 21: Main execution
async function main() {
  console.log('🐙 GITHUB API CONNECTION DEMO\n');
  console.log('Configuration:');
  console.log('  Token:', GITHUB_TOKEN?.substring(0, 20) + '...');
  console.log('  Owner:', GITHUB_OWNER);
  console.log('');

  const github = new GitHubAPI();

  // Test various operations
  await github.getUserInfo();
  await github.listRepos({ limit: 5 });
  // await github.getRepoStats();
}

// STEP 22: Export for use in other files
export default GitHubAPI;

// STEP 23: Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}