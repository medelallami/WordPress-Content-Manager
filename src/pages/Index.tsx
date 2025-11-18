import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WordPressConnection from '@/components/WordPressConnection';
import ContentFetcher from '@/components/ContentFetcher';
import ContentDashboard from '@/components/ContentDashboard';
import AIProviderPanel from '@/components/AIProviderPanel';
import ContentPreview from '@/components/ContentPreview';
import PublishingPanel from '@/components/PublishingPanel';
import PublishingHistory from '@/components/PublishingHistory';
import { ScrapedContent } from '@/lib/wordpress';
import { FileText } from 'lucide-react';

export default function Index() {
  const [previewContent, setPreviewContent] = useState<ScrapedContent | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-8">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              WordPress Content Manager
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Clone, rewrite with AI, and auto-publish WordPress content
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="fetch">Fetch</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6 pt-4">
            <WordPressConnection />
          </TabsContent>

          <TabsContent value="fetch" className="space-y-6 pt-4">
            <ContentFetcher />
          </TabsContent>

          <TabsContent value="library" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentDashboard onPreview={setPreviewContent} />
              <ContentPreview content={previewContent} />
            </div>
          </TabsContent>

          <TabsContent value="rewrite" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIProviderPanel />
              <ContentPreview content={previewContent} />
            </div>
          </TabsContent>

          <TabsContent value="publish" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PublishingPanel />
              <ContentPreview content={previewContent} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 pt-4">
            <PublishingHistory />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Built with React, TypeScript, and shadcn/ui</p>
        </div>
      </div>
    </div>
  );
}