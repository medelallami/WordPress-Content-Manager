import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { loadFromLocalStorage, publishToWordPress, ScrapedContent, WordPressCredentials } from '@/lib/wordpress';
import { toast } from 'sonner';

export default function PublishingPanel() {
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'publish' | 'draft'>('draft');
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  const publishSelectedContent = async () => {
    const credentials = loadFromLocalStorage<WordPressCredentials>('wp_credentials');
    if (!credentials || !credentials.siteUrl) {
      toast.error('Please configure WordPress connection first');
      return;
    }

    const contents = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
    const selected = contents.filter(c => c.selected && c.reformed);

    if (selected.length === 0) {
      toast.error('No reformed content selected for publishing');
      return;
    }

    setPublishing(true);
    setProgress(0);
    setResults({ success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < selected.length; i++) {
        const content = selected[i];
        
        try {
          const result = await publishToWordPress(credentials, {
            title: content.title,
            content: content.reformed || content.content,
            excerpt: content.excerpt,
            status,
          });

          if (result.success) {
            successCount++;
            toast.success(`Published: ${content.title}`);
          } else {
            failedCount++;
            toast.error(`Failed: ${content.title}`);
          }
        } catch (error) {
          failedCount++;
          toast.error(`Error publishing: ${content.title}`);
        }

        setProgress(((i + 1) / selected.length) * 100);
        setResults({ success: successCount, failed: failedCount });
      }

      toast.success(`Publishing complete! ${successCount} succeeded, ${failedCount} failed`);
    } catch (error) {
      toast.error('Error during publishing process');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish to WordPress</CardTitle>
        <CardDescription>
          Publish reformed content to your WordPress site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Only content that has been reformed by ChatGPT will be published. Make sure to process your content first.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="status">Post Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as 'publish' | 'draft')}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (Review before publishing)</SelectItem>
              <SelectItem value="publish">Publish Immediately</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {publishing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Publishing... {Math.round(progress)}%</span>
              <span>✓ {results.success} | ✗ {results.failed}</span>
            </div>
          </div>
        )}

        {!publishing && (results.success > 0 || results.failed > 0) && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Published {results.success} posts successfully. {results.failed > 0 && `${results.failed} failed.`}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={publishSelectedContent}
          disabled={publishing}
          className="w-full"
        >
          {publishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Publish Selected Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}