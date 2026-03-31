import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState } from '../../src/components/loading-state';

describe('LoadingState', () => {
  it('renders "Loading todos..." text', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });
});
