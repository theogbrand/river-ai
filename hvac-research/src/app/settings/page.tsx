import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Input,
  Button,
} from '@/components/ui';
import { Save, Key, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">
          Configure API keys and system settings
        </p>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-500" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure your API keys for external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenAI API Key</label>
            <Input
              type="password"
              placeholder="sk-..."
              defaultValue=""
              disabled
            />
            <p className="text-xs text-gray-500">
              Set via OPENAI_API_KEY environment variable
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            <CardTitle>Database</CardTitle>
          </div>
          <CardDescription>
            PostgreSQL database connection (Supabase)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Database URL</label>
            <Input
              type="password"
              placeholder="postgresql://..."
              defaultValue=""
              disabled
            />
            <p className="text-xs text-gray-500">
              Set via DATABASE_URL environment variable
            </p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
            Database connection is configured via environment variables. Update
            your .env file to change database settings.
          </div>
        </CardContent>
      </Card>

      {/* Cache */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <CardTitle>Cache & Rate Limiting</CardTitle>
          </div>
          <CardDescription>
            Redis configuration for caching and rate limiting (Upstash)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upstash Redis URL</label>
            <Input
              type="password"
              placeholder="https://..."
              defaultValue=""
              disabled
            />
            <p className="text-xs text-gray-500">
              Set via UPSTASH_REDIS_REST_URL environment variable
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environment Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Setup</CardTitle>
          <CardDescription>
            Required environment variables for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
{`# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."

# OpenAI API
OPENAI_API_KEY="sk-..."

# Upstash Redis (optional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."`}
          </pre>
          <p className="mt-4 text-sm text-gray-500">
            Copy these variables to your <code className="bg-gray-100 px-1 rounded">.env</code> file
            and fill in your credentials. See <code className="bg-gray-100 px-1 rounded">.env.example</code> for
            a complete template.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
