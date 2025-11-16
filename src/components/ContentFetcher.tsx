import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link as LinkIcon, Rss } from 'lucide-react';
import { scrapeContentFromUrl, parseRSSFeed, saveToLocalStorage, loadFromLocalStorage, ScrapedContent } from '@/lib/wordpress';
import { toast } from 'sonner';

export default function ContentFetcher() {
  const [url, setUrl] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [fetching, setFetching] = useState(false);

  const handleFetchUrl = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    setFetching(true);
    try {
      const content = await scrapeContentFromUrl(url);
      if (content) {
        const existingContent = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
        existingContent.push(content);
        saveToLocalStorage('scraped_content', existingContent);
        toast.success('Content fetched successfully!');
        setUrl('');
        window.dispatchEvent(new Event('content-updated'));
      } else {
        toast.error('Failed to fetch content from URL');
      }
    } catch (error) {
      toast.error('Error fetching content. Note: CORS may block direct scraping.');
    } finally {
      setFetching(false);
    }
  };

  const handleFetchRSS = async () => {
    if (!rssUrl) {
      toast.error('Please enter an RSS feed URL');
      return;
    }

    setFetching(true);
    try {
      const contents = await parseRSSFeed(rssUrl);
      if (contents.length > 0) {
        const existingContent = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
        existingContent.push(...contents);
        saveToLocalStorage('scraped_content', existingContent);
        toast.success(`Fetched ${contents.length} items from RSS feed!`);
        setRssUrl('');
        window.dispatchEvent(new Event('content-updated'));
      } else {
        toast.error('No content found in RSS feed');
      }
    } catch (error) {
      toast.error('Error parsing RSS feed. Note: CORS may block direct access.');
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fetch Content</CardTitle>
        <CardDescription>
          Import content from WordPress sites via URL or RSS feed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Single URL</TabsTrigger>
            <TabsTrigger value="rss">RSS Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <Alert>
              <AlertDescription>
                Note: Direct web scraping may be blocked by CORS. For production use, consider setting up a backend proxy server.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="url">Content URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/post-title"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <Button onClick={handleFetchUrl} disabled={fetching || !url}>
              {fetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Fetch Content
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="rss" className="space-y-4">
            <Alert>
              <AlertDescription>
                RSS feeds typically work better than direct scraping. Enter your WordPress RSS feed URL (usually /feed/).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="rssUrl">RSS Feed URL</Label>
              <Input
                id="rssUrl"
                placeholder="https://example.com/feed/"
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
              />
            </div>

            <Button onClick={handleFetchRSS} disabled={fetching || !rssUrl}>
              {fetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Rss className="mr-2 h-4 w-4" />
                  Fetch RSS Feed
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}