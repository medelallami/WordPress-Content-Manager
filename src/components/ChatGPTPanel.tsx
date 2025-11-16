import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Loader2, Wand2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage, rewriteWithChatGPT, ScrapedContent } from '@/lib/wordpress';
import { toast } from 'sonner';

export default function ChatGPTPanel() {
  const [apiKey, setApiKey] = useState(loadFromLocalStorage<string>('chatgpt_api_key') || '');
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('informative');
  const [seoOptimize, setSeoOptimize] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const saveApiKey = () => {
    saveToLocalStorage('chatgpt_api_key', apiKey);
    toast.success('API key saved');
  };

  const processSelectedContent = async () => {
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    const contents = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
    const selected = contents.filter(c => c.selected);

    if (selected.length === 0) {
      toast.error('No content selected for processing');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      for (let i = 0; i < selected.length; i++) {
        const content = selected[i];
        
        try {
          const reformed = await rewriteWithChatGPT(content.content, apiKey, {
            tone,
            style,
            seo: seoOptimize,
          });

          // Update the content with reformed version
          const allContents = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
          const updated = allContents.map(c =>
            c.id === content.id ? { ...c, reformed } : c
          );
          saveToLocalStorage('scraped_content', updated);

          setProgress(((i + 1) / selected.length) * 100);
        } catch (error) {
          toast.error(`Failed to process: ${content.title}`);
        }
      }

      toast.success(`Successfully processed ${selected.length} items!`);
      window.dispatchEvent(new Event('content-updated'));
    } catch (error) {
      toast.error('Error processing content');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ChatGPT Content Rewriting</CardTitle>
        <CardDescription>
          Configure AI settings to automatically rewrite selected content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={saveApiKey} variant="outline">
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from: https://platform.openai.com/api-keys
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="seo">SEO Optimization</Label>
          <Switch
            id="seo"
            checked={seoOptimize}
            onCheckedChange={setSeoOptimize}
          />
        </div>

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing content... {Math.round(progress)}%
            </p>
          </div>
        )}

        <Button
          onClick={processSelectedContent}
          disabled={processing || !apiKey}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Rewrite Selected Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}