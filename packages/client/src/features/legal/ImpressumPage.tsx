import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { APP_VERSION } from '@strathub/shared';

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Impressum</h1>
        <Badge variant="outline" className="text-xs">v{APP_VERSION}</Badge>
      </div>

      <div className="space-y-8">
        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-medium">Niklas Kronig</p>
            <p className="text-muted-foreground">
              StratHub is a personal project developed and maintained by Niklas Kronig.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About StratHub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              StratHub is a modern, collaborative strategy planning tool for competitive games.
              It allows teams to draw tactics on game maps, share battle plans, and coordinate
              strategies in real-time.
            </p>
            <p className="text-muted-foreground">
              This project is built upon the ideas and work of two original open-source projects
              that are unfortunately no longer actively maintained. StratHub merges their best
              features into a single, modern application with a new tech stack and additional functionality.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Original Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Based On</h2>
          <p className="text-muted-foreground mb-6">
            StratHub would not exist without these two projects. While both have been inactive for
            several years, they laid the groundwork for what StratHub is today.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-map-planner
                  <a
                    href="https://github.com/prayansh/r6-map-planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">prayansh</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  A real-time collaborative map planning tool built with Node.js, Express and
                  Socket.IO. It provided the foundation for the real-time collaboration features,
                  live cursor tracking, and the multi-game canvas drawing system.
                </p>
                <a
                  href="https://github.com/prayansh/r6-map-planner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/prayansh/r6-map-planner
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-maps
                  <a
                    href="https://github.com/jayfoe/r6-maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">jayfoe</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  A battle plan management system built with Laravel and Vue.js. It provided
                  the blueprint for user authentication, database persistence, battle plan
                  management, voting system, and the admin panel.
                </p>
                <a
                  href="https://github.com/jayfoe/r6-maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/jayfoe/r6-maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">v1.2.1</Badge>
                <span className="text-xs text-muted-foreground">Current</span>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 ml-2">
                <li>Zoom + Pan (mouse wheel, pan tool, middle-click, zoom limits 25%-400%)</li>
                <li>Eraser tool (click to delete drawings)</li>
                <li>Undo/Redo (Ctrl+Z / Ctrl+Y, toolbar buttons)</li>
                <li>Share battle plans by link (public toggle, share button)</li>
                <li>Guest access (sandbox mode, read-only room viewing)</li>
                <li>Compass overlay on canvas</li>
                <li>Improved room creation with game/map selection flow</li>
                <li>Help page, FAQ page, and versioned Impressum</li>
              </ul>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">v1.1.0</Badge>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 ml-2">
                <li>Branding update (StratHub logo, orange/red color scheme)</li>
                <li>Impressum page with credits to original projects</li>
                <li>README and CLAUDE.md documentation</li>
              </ul>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 ml-2">
                <li>Initial release</li>
                <li>Multi-game support (R6 Siege, Valorant)</li>
                <li>Real-time collaboration rooms with Socket.IO</li>
                <li>Canvas drawing (pen, line, rectangle, text, icons)</li>
                <li>Battle plan CRUD with voting system</li>
                <li>Admin panel for game/map/operator management</li>
                <li>JWT authentication with email verification</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              StratHub is built as a modern TypeScript monorepo using:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>React + Vite (Frontend)</li>
              <li>Fastify (Backend API)</li>
              <li>Socket.IO (Real-time Communication)</li>
              <li>PostgreSQL + Drizzle ORM (Database)</li>
              <li>Redis (Caching & Session Management)</li>
              <li>Tailwind CSS + shadcn/ui (UI)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Source Code */}
        <Card>
          <CardHeader>
            <CardTitle>Source Code</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/niklask52t/StratHub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              github.com/niklask52t/StratHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              StratHub is a fan-made tool and is not affiliated with, endorsed by, or connected
              to Ubisoft, Riot Games, or any other game publisher. All game names, logos, and
              related assets are trademarks of their respective owners.
            </p>
            <p>
              Map images and operator/agent icons used in this application are property of their
              respective game publishers and are used for informational and educational purposes only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
