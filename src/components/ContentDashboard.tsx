import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage, ScrapedContent } from '@/lib/wordpress';
import { toast } from 'sonner';

interface ContentDashboardProps {
  onPreview: (content: ScrapedContent) => void;
}

export default function ContentDashboard({ onPreview }: ContentDashboardProps) {
  const [contents, setContents] = useState<ScrapedContent[]>([]);

  useEffect(() => {
    loadContents();
    
    const handleUpdate = () => loadContents();
    window.addEventListener('content-updated', handleUpdate);
    return () => window.removeEventListener('content-updated', handleUpdate);
  }, []);

  const loadContents = () => {
    const stored = loadFromLocalStorage<ScrapedContent[]>('scraped_content') || [];
    setContents(stored);
  };

  const toggleSelection = (id: string) => {
    const updated = contents.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    );
    setContents(updated);
    saveToLocalStorage('scraped_content', updated);
  };

  const deleteContent = (id: string) => {
    const updated = contents.filter(c => c.id !== id);
    setContents(updated);
    saveToLocalStorage('scraped_content', updated);
    toast.success('Content deleted');
  };

  const selectAll = () => {
    const updated = contents.map(c => ({ ...c, selected: true }));
    setContents(updated);
    saveToLocalStorage('scraped_content', updated);
  };

  const deselectAll = () => {
    const updated = contents.map(c => ({ ...c, selected: false }));
    setContents(updated);
    saveToLocalStorage('scraped_content', updated);
  };

  const selectedCount = contents.filter(c => c.selected).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Library</CardTitle>
            <CardDescription>
              {contents.length} items fetched • {selectedCount} selected
            </CardDescription>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No content fetched yet. Use the Content Fetcher to import content.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={content.selected}
                    onCheckedChange={() => toggleSelection(content.id)}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm line-clamp-2">{content.title}</h3>
                      <div className="flex gap-2 ml-2">
                        {content.reformed && (
                          <Badge variant="secondary" className="text-xs">Reformed</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {content.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(content.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <a href={content.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Source
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPreview(content)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContent(content.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}