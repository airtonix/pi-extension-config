import type { AgentToolResult, ExtensionAPI } from '@mariozechner/pi-coding-agent';
import { getMarkdownTheme } from '@mariozechner/pi-coding-agent';
import { Container, Markdown, matchesKey } from '@mariozechner/pi-tui';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Type, Static } from '@mariozechner/pi-ai';
import { Parse } from '@sinclair/typebox/value';
import { createConfigService } from '../../src/index.ts';

const DemoConfigSchema = Type.Object({
  enabled: Type.Boolean({ description: 'Whether the demo greeting is enabled.', default: true }),
  greeting: Type.String({ description: 'The greeting message to use.', default: 'Hello' }),
  defaultName: Type.String({
    description: 'The default name to greet if no name is provided.',
    default: 'World',
  }),
});

type DemoConfig = Static<typeof DemoConfigSchema>;

async function writeConfigJsonSchema() {
  const output = JSON.stringify(Type.Partial(DemoConfigSchema), null, 2);
  const here = path.dirname(fileURLToPath(import.meta.url));
  await fs.writeFile(path.join(here, 'demo-config.schema.json'), output, 'utf-8');
}

export default async function demoExtension(pi: ExtensionAPI): Promise<void> {
  await writeConfigJsonSchema();
  const configService = await createConfigService<DemoConfig>('demo', {
    defaults: Parse(DemoConfigSchema, {}),
    parse: (value) => Parse(DemoConfigSchema, value),
  });

  pi.registerCommand('demo-config', {
    description: 'Show the parsed demo configuration.',
    handler: async (_args, ctx) => {
      try {
        const defaults = Parse(DemoConfigSchema, {});
        const resolved = configService.config;

        const markdown = [
          '## Demo Config',
          '',
          '|              | enabled | greeting | defaultName |',
          '|--------------|---------|----------|-------------|',
          `| **defaults** | ${defaults.enabled} | ${defaults.greeting} | ${defaults.defaultName} |`,
          `| **resolved** | ${resolved.enabled} | ${resolved.greeting} | ${resolved.defaultName} |`,
          '',
          '_Press any key to close_',
        ].join('\n');

        await ctx.ui.custom((tui, _theme, _kb, done) => {
          const container = new Container();
          const md = new Markdown(markdown, 1, 1, getMarkdownTheme());
          container.addChild(md);

          return {
            render: (width: number) => container.render(width),
            invalidate: () => container.invalidate(),
            handleInput: (data: string) => {
              if (matchesKey(data, 'escape') || data.length > 0) {
                done(undefined);
              }
            },
          };
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`Failed to load demo config: ${message}`, 'error');
      }
    },
  });

  pi.registerTool({
    name: 'demo_greet',
    label: 'Demo Greet',
    description: 'Greet a person using configuration loaded by createConfigService.',
    parameters: Type.Object({
      name: Type.Optional(Type.String({ description: 'Optional name override.' })),
    }),
    async execute(
      _toolCallId,
      params
    ): Promise<
      AgentToolResult<
        | {
            config: DemoConfig;
            name?: string;
          }
        | {
            error?: string | null;
          }
      >
    > {
      try {
        if (!configService.config.enabled) {
          const details = { config: configService.config } as const;
          return {
            content: [{ type: 'text', text: 'Demo greeting is disabled by config.' }],
            details,
          };
        }

        const providedName = typeof params.name === 'string' ? params.name.trim() : '';
        const name = providedName.length > 0 ? providedName : configService.config.defaultName;
        const details = { config: configService.config, name } as const;

        return {
          content: [{ type: 'text', text: `${configService.config.greeting}, ${name}!` }],
          details,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const details = { error: message } as const;

        return {
          content: [{ type: 'text', text: `Failed to load config: ${message}` }],
          details,
        };
      }
    },
  });
}
