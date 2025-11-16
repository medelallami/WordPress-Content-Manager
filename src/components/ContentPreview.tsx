import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ScrapedContent } from '@/lib/wordpress';

interface ContentPreviewProps {
  content: ScrapedContent | null;
}

export default function ContentPreview({ content }: ContentPreviewProps) {
  if (!content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Preview</CardTitle>
          <CardDescription>Select content from the dashboard to preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No content selected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{content.title}</CardTitle>
            {content.reformed && (
              <Badge variant="secondary">Reformed Available</Badge>
            )}
          </div>
          <CardDescription>
            {new Date(content.date).toLocaleDateString()} • {' '}
            <a href={content.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              View Source
            </a>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">Original Content</TabsTrigger>
            <TabsTrigger value="reformed" disabled={!content.reformed}>
              Reformed Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reformed">
            {content.reformed ? (
              <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.reformed }}
                />
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No reformed content available. Use ChatGPT panel to rewrite this content.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}