import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/wordpress';
import { toast } from 'sonner';

interface PublishedPost {
  postId: number;
  title: string;
  date: string;
  url: string;
}

export default function PublishingHistory() {
  const [history, setHistory] = useState<PublishedPost[]>([]);

  useEffect(() => {
    const loadedHistory = loadFromLocalStorage<PublishedPost[]>('publishing_history') || [];
    setHistory(loadedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const clearHistory = () => {
    saveToLocalStorage('publishing_history', []);
    setHistory([]);
    toast.success('Publishing history cleared');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Publishing History</CardTitle>
            <CardDescription>A log of all content published to WordPress.</CardDescription>
        </div>
        <Button variant="destructive" size="sm" onClick={clearHistory} disabled={history.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length > 0 ? (
              history.map((post) => (
                <TableRow key={post.postId}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{new Date(post.date).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">View Post</Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No publishing history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}