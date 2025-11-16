import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { validateWordPressConnection, saveToLocalStorage, loadFromLocalStorage, WordPressCredentials } from '@/lib/wordpress';

export default function WordPressConnection() {
  const [credentials, setCredentials] = useState<WordPressCredentials>(
    loadFromLocalStorage<WordPressCredentials>('wp_credentials') || {
      siteUrl: '',
      username: '',
      applicationPassword: '',
    }
  );
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    setTesting(true);
    setConnectionStatus('idle');
    setMessage('');

    try {
      const isValid = await validateWordPressConnection(credentials);
      if (isValid) {
        setConnectionStatus('success');
        setMessage('Connection successful! Credentials saved.');
        saveToLocalStorage('wp_credentials', credentials);
      } else {
        setConnectionStatus('error');
        setMessage('Connection failed. Please check your credentials.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage('Connection error. Please verify your site URL and credentials.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WordPress Connection</CardTitle>
        <CardDescription>
          Configure your WordPress site credentials for publishing content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="siteUrl">WordPress Site URL</Label>
          <Input
            id="siteUrl"
            placeholder="https://yoursite.com"
            value={credentials.siteUrl}
            onChange={(e) => setCredentials({ ...credentials, siteUrl: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="admin"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appPassword">Application Password</Label>
          <Input
            id="appPassword"
            type="password"
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            value={credentials.applicationPassword}
            onChange={(e) => setCredentials({ ...credentials, applicationPassword: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Generate an application password in WordPress: Users → Profile → Application Passwords
          </p>
        </div>

        <Button onClick={handleTest} disabled={testing || !credentials.siteUrl || !credentials.username || !credentials.applicationPassword}>
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {connectionStatus !== 'idle' && (
          <Alert variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
            {connectionStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}