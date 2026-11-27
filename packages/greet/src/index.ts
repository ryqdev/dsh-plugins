import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import Schema from '@deepseek-ai/schemastery'

export const name = 'greet'

// Cordis waits for these services before calling `apply`.
export const inject = ['tools']

export interface Config {
  greeting: string
}

// Validated when the plugin loads; override it from a `cordis.patch.yml` row's `config`.
export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
})

export function apply(ctx: Context, config: Config) {
  // Registrations made through `ctx` are removed automatically when the plugin unloads.
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet someone by name.',
    parameters: {
      name: { type: 'string', required: true, description: 'The name to greet' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return `${config.greeting}, ${args.name}!`
    },
  }))
}
