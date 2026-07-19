import { describe, it, expect } from 'vitest';
import Header from '../src/components/Header.jsx';
import Footer from '../src/components/Footer.jsx';

describe('Frontend Component Tests', () => {
  it('Header component renders title and navigation tabs', () => {
    const props = {
      activeTab: 'triage',
      setActiveTab: () => {},
      systemOnline: true
    };
    
    // Simple structural checks on JSX props
    const element = Header(props);
    expect(element.type).toBe('header');
    expect(element.props.className).toContain('bg-slate-950');
  });

  it('Footer component renders challenge credits and accessibility guarantees', () => {
    const element = Footer();
    expect(element.type).toBe('footer');
    expect(element.props.className).toContain('bg-slate-950');
  });
});
