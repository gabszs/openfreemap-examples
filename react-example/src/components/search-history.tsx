import { useCallback, useEffect } from 'react';
import { useControl } from '@vis.gl/react-maplibre';
import type { IControl, Map } from 'maplibre-gl';

interface SearchHistoryProps {
  history: string[];
  onSelect: (location: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

class SearchHistoryControl implements IControl {
  private _map?: Map;
  private _container?: HTMLDivElement;
  private _history: string[];
  private _onSelect: (location: string) => void;

  constructor(history: string[], onSelect: (location: string) => void) {
    this._history = history;
    this._onSelect = onSelect;
  }

  onAdd(map: Map): HTMLElement {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl';
    this._container.style.background = 'rgba(0, 0, 0, 0.8)';
    this._container.style.padding = '8px';
    this._container.style.borderRadius = '4px';
    this._container.style.maxWidth = '200px';
    this._container.style.marginTop = '10px';

    this.updateHistory();
    return this._container;
  }

  onRemove(): void {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }

  updateHistory(): void {
    if (!this._container) return;

    this._container.innerHTML = '';

    if (this._history.length === 0) {
      return;
    }

    const title = document.createElement('div');
    title.textContent = 'Recent Searches';
    title.style.fontSize = '11px';
    title.style.fontWeight = 'bold';
    title.style.color = '#fff';
    title.style.marginBottom = '5px';
    title.style.fontFamily = 'sans-serif';
    this._container.appendChild(title);

    this._history.forEach((item) => {
      const button = document.createElement('button');
      button.textContent = item;
      button.style.display = 'block';
      button.style.width = '100%';
      button.style.padding = '5px';
      button.style.marginBottom = '3px';
      button.style.background = 'rgba(255, 255, 255, 0.1)';
      button.style.color = '#fff';
      button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      button.style.borderRadius = '3px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '11px';
      button.style.textAlign = 'left';
      button.style.fontFamily = 'sans-serif';
      button.style.overflow = 'hidden';
      button.style.textOverflow = 'ellipsis';
      button.style.whiteSpace = 'nowrap';

      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
      });

      button.addEventListener('click', () => {
        this._onSelect(item);
      });

      this._container!.appendChild(button);
    });
  }

  setHistory(history: string[]): void {
    this._history = history;
    this.updateHistory();
  }
}

export default function SearchHistory({ history, onSelect, position = 'top-left' }: SearchHistoryProps) {
  const control = useCallback(() => new SearchHistoryControl(history, onSelect), []);

  const ctrl = useControl(control, { position });

  useEffect(() => {
    if (ctrl && 'setHistory' in ctrl) {
      (ctrl as SearchHistoryControl).setHistory(history);
    }
  }, [ctrl, history]);

  return null;
}
