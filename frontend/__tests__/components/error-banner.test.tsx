import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBanner } from '../../src/components/error-banner';

describe('ErrorBanner', () => {
  it('renders error message text', () => {
    render(<ErrorBanner message="Something went wrong" onDismiss={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders Dismiss button and calls onDismiss when clicked', async () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={onDismiss} />);

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissBtn).toBeInTheDocument();

    await userEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders Retry button when onRetry is provided and calls onRetry when clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={vi.fn()} onRetry={onRetry} />);

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    await userEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not render Retry button when onRetry is not provided', () => {
    render(<ErrorBanner message="Error" onDismiss={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('has role="alert" on container', () => {
    render(<ErrorBanner message="Error" onDismiss={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
