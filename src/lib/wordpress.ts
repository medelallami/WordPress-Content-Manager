// WordPress API helper functions

export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface WordPressPost {
  id?: number;
  title: string;
  content: string;
  excerpt?: string;
  status: 'publish' | 'draft';
  categories?: number[];
  tags?: number[];
  date?: string;
}

export interface ScrapedContent {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url: string;
  date: string;
  selected: boolean;
  reformed?: string;
}

// Validate WordPress connection
export async function validateWordPressConnection(credentials: WordPressCredentials): Promise<boolean> {
  try {
    const auth = btoa(`${credentials.username}:${credentials.applicationPassword}`);
    const response = await fetch(`${credentials.siteUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('WordPress connection error:', error);
    return false;
  }
}

// Publish post to WordPress
export async function publishToWordPress(
  credentials: WordPressCredentials,
  post: WordPressPost
): Promise<{ success: boolean; message: string; postId?: number }> {
  try {
    const auth = btoa(`${credentials.username}:${credentials.applicationPassword}`);
    const response = await fetch(`${credentials.siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        categories: post.categories,
        tags: post.tags,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: 'Post published successfully', postId: data.id };
    } else {
      const error = await response.text();
      return { success: false, message: `Failed to publish: ${error}` };
    }
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

// Scrape content from URL
export async function scrapeContentFromUrl(url: string): Promise<ScrapedContent | null> {
  try {
    // Note: Direct scraping from browser has CORS limitations
    // This is a simplified version - in production, you'd need a backend proxy
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = doc.querySelector('h1')?.textContent || doc.querySelector('title')?.textContent || 'Untitled';
    const content = doc.querySelector('article')?.innerHTML || doc.querySelector('.entry-content')?.innerHTML || doc.body.innerHTML;
    const excerpt = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    return {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      url,
      date: new Date().toISOString(),
      selected: false,
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

// Parse RSS feed
export async function parseRSSFeed(feedUrl: string): Promise<ScrapedContent[]> {
  try {
    const response = await fetch(feedUrl);
    const text = await response.text();
    
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    const contents: ScrapedContent[] = [];
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || 'Untitled';
      const content = item.querySelector('content\\:encoded')?.textContent || 
                     item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      
      contents.push({
        id: `rss-${Date.now()}-${index}`,
        title: title.trim(),
        content: content.trim(),
        excerpt: content.substring(0, 200).trim() + '...',
        url: link,
        date: pubDate,
        selected: false,
      });
    });
    
    return contents;
  } catch (error) {
    console.error('RSS parsing error:', error);
    return [];
  }
}

// Rewrite content using ChatGPT
export async function rewriteWithChatGPT(
  content: string,
  apiKey: string,
  options: { tone?: string; style?: string; seo?: boolean }
): Promise<string> {
  try {
    const prompt = `Rewrite the following content with these requirements:
${options.tone ? `- Tone: ${options.tone}` : ''}
${options.style ? `- Style: ${options.style}` : ''}
${options.seo ? '- Optimize for SEO' : ''}

Original content:
${content}

Rewritten content:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional content writer and editor.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      throw new Error('ChatGPT API request failed');
    }
  } catch (error) {
    console.error('ChatGPT error:', error);
    throw error;
  }
}

// Storage helpers
export function saveToLocalStorage(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromLocalStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}