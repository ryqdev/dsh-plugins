import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { describe, expect, it } from 'vitest'

import * as greet from '../src/index.js'

// The call id is a branded string a model provider would issue; tests cast a plain one.
type ToolCall = Parameters<Context['tools']['execute']>[0]['calls'][number]

// The smallest composition that can run a tool: no model and no API key involved.
async function host(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(NativeToolExecutor)
  return ctx
}

async function setup(config?: greet.Config): Promise<Context> {
  const ctx = await host()
  await ctx.plugin(greet, config)
  return ctx
}

// Stands in for the model: sends one `greet` call through the execution pipeline.
async function callGreet(ctx: Context, args: unknown): Promise<string> {
  const { results } = await ctx.tools.execute({
    calls: [{ type: 'tool-call', id: 'call-1', name: 'greet', arguments: JSON.stringify(args) } as ToolCall],
    signal: new AbortController().signal,
  })
  return results[0]!.result.content
    .map(block => (block.type === 'text' ? block.text : ''))
    .join('')
}

describe('greet plugin', () => {
  it('registers a `greet` tool that takes a required `name`', async () => {
    const ctx = await setup()
    const schema = ctx.tools.schemas().find(tool => tool.name === 'greet')
    expect(schema?.parameters).toMatchObject({
      properties: { name: { type: 'string' } },
      required: ['name'],
    })
  })

  it('greets with the default greeting', async () => {
    const ctx = await setup()
    expect(await callGreet(ctx, { name: 'Ada' })).toBe('Hello, Ada!')
  })

  it('uses the configured greeting', async () => {
    const ctx = await setup({ greeting: 'Hi there' })
    expect(await callGreet(ctx, { name: 'Ada' })).toBe('Hi there, Ada!')
  })

  it('unregisters the tool when the plugin unloads', async () => {
    const ctx = await host()
    const fiber = ctx.plugin(greet)
    await fiber
    expect(ctx.tools.schemas().some(tool => tool.name === 'greet')).toBe(true)
    await fiber.dispose()
    expect(ctx.tools.schemas().some(tool => tool.name === 'greet')).toBe(false)
  })
})
