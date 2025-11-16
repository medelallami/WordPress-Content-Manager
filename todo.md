# WordPress Content Cloning & Auto-Publishing App - Development Plan

## Overview
A self-hosted web application that clones content from WordPress sites via URL/RSS, rewrites content using ChatGPT, and auto-publishes back to WordPress.

## File Structure (8 files max)

### Core Files to Create:
1. **src/pages/Index.tsx** - Main dashboard with tabs for different sections
2. **src/components/WordPressConnection.tsx** - WordPress credentials input and connection management
3. **src/components/ContentFetcher.tsx** - Fetch content from URLs/RSS feeds using web scraping
4. **src/components/ContentDashboard.tsx** - Display fetched content with selection
5. **src/components/ChatGPTPanel.tsx** - ChatGPT API configuration and content rewriting
6. **src/components/ContentPreview.tsx** - Side-by-side preview of original vs reformed content
7. **src/components/PublishingPanel.tsx** - Auto-publish reformed content to WordPress
8. **src/lib/wordpress.ts** - WordPress API helper functions

### Data Flow:
1. User inputs WordPress credentials + source URLs/RSS
2. Fetch content via web scraping (parse HTML/RSS)
3. Store in localStorage (no Supabase as per backend info)
4. User selects content and configures ChatGPT rewriting
5. Reformed content displayed for review
6. Publish to target WordPress site via REST API

### Key Features:
- Web scraping for content fetching (no WordPress API dependency)
- ChatGPT integration for content rewriting
- WordPress REST API for publishing only
- localStorage for data persistence
- Batch processing capability
- Tag and category management

### Tech Stack:
- React + TypeScript
- Shadcn-ui components
- Tailwind CSS
- localStorage for data storage
- Fetch API for HTTP requests