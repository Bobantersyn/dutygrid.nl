import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Basic setup
global.fetch = vi.fn();