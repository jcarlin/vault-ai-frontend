import { describe, it, expect } from 'vitest';
import { streamChatCompletion, type StreamEvent } from '../chat';

describe('streamChatCompletion', () => {
  it('yields chunk events with content', async () => {
    const events: StreamEvent[] = [];

    for await (const event of streamChatCompletion({
      model: 'qwen2.5-32b-awq',
      messages: [{ role: 'user', content: 'Hi' }],
    })) {
      events.push(event);
    }

    const contentEvents = events.filter(
      (e) => e.type === 'chunk' && e.content,
    );
    expect(contentEvents.length).toBeGreaterThan(0);

    const allContent = contentEvents.map((e) => e.content).join('');
    expect(allContent).toBe('Hello world');
  });

  it('yields done event at end', async () => {
    const events: StreamEvent[] = [];

    for await (const event of streamChatCompletion({
      model: 'qwen2.5-32b-awq',
      messages: [{ role: 'user', content: 'Hi' }],
    })) {
      events.push(event);
    }

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('done');
  });

  it('handles [DONE] sentinel correctly', async () => {
    const events: StreamEvent[] = [];

    for await (const event of streamChatCompletion({
      model: 'qwen2.5-32b-awq',
      messages: [{ role: 'user', content: 'Hi' }],
    })) {
      events.push(event);
    }

    // Should have chunk events followed by exactly one done event
    const doneEvents = events.filter((e) => e.type === 'done');
    expect(doneEvents).toHaveLength(1);

    // No events after done
    const doneIndex = events.findIndex((e) => e.type === 'done');
    expect(doneIndex).toBe(events.length - 1);
  });
});
