import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../../src/components/empty-state';

describe('EmptyState', () => {
  it('renders "No todos yet" text', () => {
    render(<EmptyState />);
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });
});
