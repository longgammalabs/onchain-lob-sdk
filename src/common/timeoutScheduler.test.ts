import { TimeoutScheduler } from './timeoutScheduler';

describe('TimeoutScheduler.reset', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('cancels a pending scheduled action', async () => {
    const scheduler = new TimeoutScheduler([1000, 5000]);
    const action = jest.fn();

    void scheduler.setTimeout(action);
    scheduler.reset();
    jest.advanceTimersByTime(10000);

    expect(action).not.toHaveBeenCalled();
  });

  it('resets the escalation counter so the next timeout starts from the first step', () => {
    const scheduler = new TimeoutScheduler([1000, 5000, 30000]);

    void scheduler.setTimeout(() => {});
    void scheduler.setTimeout(() => {});
    expect(scheduler.counter).toBe(2);

    scheduler.reset();
    expect(scheduler.counter).toBe(0);

    const action = jest.fn();
    void scheduler.setTimeout(action);
    // Counter was reset → first (1000ms) step, not the escalated 30000ms one.
    jest.advanceTimersByTime(1000);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('clears the counter-expiration watcher', () => {
    const scheduler = new TimeoutScheduler([1000], 120000);

    void scheduler.setTimeout(() => {});
    scheduler.reset();

    // No pending timers should remain after a reset.
    expect(jest.getTimerCount()).toBe(0);
  });
});
