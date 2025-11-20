import { useCallback } from 'react';
import { useControl } from '@vis.gl/react-maplibre';
import type { IControl, Map } from 'maplibre-gl';

export type MapTheme = 'liberty' | 'bright' | 'positron' | 'dark' | 'fiord';

interface ThemeSelectorProps {
  theme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

class ThemeSelectorControl implements IControl {
  private _container?: HTMLDivElement;
  private _select?: HTMLSelectElement;
  private _theme: MapTheme;
  private _onChange: (theme: MapTheme) => void;

  constructor(theme: MapTheme, onChange: (theme: MapTheme) => void) {
    this._theme = theme;
    this._onChange = onChange;
  }

  onAdd(_map: Map): HTMLElement {
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    this._container.style.background = 'white';
    this._container.style.padding = '5px';

    this._select = document.createElement('select');
    this._select.style.border = 'none';
    this._select.style.fontSize = '12px';
    this._select.style.cursor = 'pointer';
    this._select.value = this._theme;

    const themes: { value: MapTheme; label: string }[] = [
      { value: 'liberty', label: 'Liberty' },
      { value: 'bright', label: 'Bright' },
      { value: 'positron', label: 'Positron' },
      { value: 'dark', label: 'Dark' },
      { value: 'fiord', label: 'Fiord' }
    ];

    themes.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      this._select!.appendChild(option);
    });

    this._select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this._onChange(target.value as MapTheme);
    });

    this._container.appendChild(this._select);
    return this._container;
  }

  onRemove(): void {
    this._container?.parentNode?.removeChild(this._container);
  }

  updateTheme(theme: MapTheme): void {
    this._theme = theme;
    if (this._select) {
      this._select.value = theme;
    }
  }
}

export default function ThemeSelector({ theme, onThemeChange, position = 'top-right' }: ThemeSelectorProps) {
  const control = useCallback(() => new ThemeSelectorControl(theme, onThemeChange), [theme, onThemeChange]);

  useControl(control, { position });

  return null;
}
