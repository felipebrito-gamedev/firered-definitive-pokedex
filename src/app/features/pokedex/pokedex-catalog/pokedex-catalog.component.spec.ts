import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subject } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../../app.routes';
import { SEED_SPECIES } from '../../../core/data/pokedex-seed.data';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';
import { PokedexStartupService } from '../../../core/pokedex/pokedex-startup.service';
import { SpeciesDetailComponent } from '../species-detail/species-detail.component';
import { PokedexCatalogComponent } from './pokedex-catalog.component';

describe('PokedexCatalogComponent', () => {
  beforeEach(() => {
    // jsdom has no native scrolling; verify scroll reset at the CDK boundary.
    vi.spyOn(CdkVirtualScrollViewport.prototype, 'scrollToIndex').mockImplementation(
      () => undefined,
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  function configure() {
    const status = signal<'loading' | 'ready' | 'error'>('ready');
    const initialize = vi.fn().mockResolvedValue(undefined);
    const dismissed = new Subject<void>();
    const open = vi.fn().mockReturnValue({ afterDismissed: () => dismissed.asObservable() });
    TestBed.configureTestingModule({
      imports: [PokedexCatalogComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter(routes),
        { provide: PokedexStartupService, useValue: { status, initialize } },
        { provide: MatBottomSheet, useValue: { open } },
      ],
    });
    const catalog = TestBed.inject(PokedexCatalogService);
    catalog.allSpecies.set([...SEED_SPECIES]);
    catalog.isLoading.set(false);
    return { status, initialize, open, catalog, dismissed };
  }

  it('shows reactive search, Fairy filtering, and an empty state', async () => {
    const { catalog } = configure();
    const fixture = TestBed.createComponent(PokedexCatalogComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Exibindo 386 de 386 Pokémon');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '#025';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-pokemon-card')?.textContent).toContain(
      'Pikachu',
    );
    expect(fixture.nativeElement.textContent).toContain('Exibindo 1 de 386 Pokémon');
    catalog.setSearchTerm('');
    const fairy = [...fixture.nativeElement.querySelectorAll('.type-chip')].find(
      (button: HTMLElement) => button.textContent?.trim() === 'Fada',
    ) as HTMLButtonElement;
    fairy.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Exibindo 17 de 386 Pokémon');
    catalog.setSearchTerm('no-such-species');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Nenhum Pokémon encontrado');
    expect(fixture.nativeElement.querySelector('app-pokemon-card')).toBeNull();
  });

  it('opens the selected species in a named sheet only after startup is ready', async () => {
    const { catalog, open, status } = configure();
    catalog.setSearchTerm('Kadabra');
    const fixture = TestBed.createComponent(PokedexCatalogComponent);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('app-pokemon-card button').click();
    expect(open).toHaveBeenCalledWith(
      SpeciesDetailComponent,
      expect.objectContaining({
        data: { species: expect.objectContaining({ id: 64 }) },
        ariaLabel: expect.stringContaining('Kadabra'),
        restoreFocus: true,
      }),
    );
    status.set('error');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-pokemon-card')).toBeNull();
  });

  it('shows loading and a localized retry action after failure', async () => {
    const { status, initialize } = configure();
    status.set('loading');
    const fixture = TestBed.createComponent(PokedexCatalogComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Carregando Pokédex');
    status.set('error');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    fixture.nativeElement.querySelector('.retry-button').click();
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the list if filtering or resizing removes the detail trigger', async () => {
    const { catalog, dismissed } = configure();
    catalog.setSearchTerm('Kadabra');
    const fixture = TestBed.createComponent(PokedexCatalogComponent);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      'app-pokemon-card button',
    ) as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    catalog.setSearchTerm('Pikachu');
    await fixture.whenStable();
    expect(trigger.isConnected).toBe(false);
    dismissed.next();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport'),
    );
  });

  it('routes home to the catalog and redirects /pokedex to home', async () => {
    configure();
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/', PokedexCatalogComponent);
    expect(page).toBeInstanceOf(PokedexCatalogComponent);
    await harness.navigateByUrl('/pokedex', PokedexCatalogComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Exibindo 386 de 386 Pokémon');
  });

  it('reflows virtual rows on resize and resets scrolling when the result set changes', async () => {
    const resizeCallbacks = new Map<Element, () => void>();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe = (element: Element) => resizeCallbacks.set(element, this.callback);
        unobserve = (element: Element) => resizeCallbacks.delete(element);
        disconnect = disconnect;
      },
    );
    const { catalog } = configure();
    const fixture = TestBed.createComponent(PokedexCatalogComponent);
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector(
      'cdk-virtual-scroll-viewport',
    ) as HTMLElement;
    Object.defineProperty(viewport, 'clientWidth', { get: () => 800 });
    resizeCallbacks.get(viewport)!();
    await fixture.whenStable();
    expect(fixture.componentInstance.columnCount()).toBe(4);
    expect(fixture.componentInstance.rows()).toHaveLength(97);
    catalog.setSearchTerm('25');
    await fixture.whenStable();
    expect(fixture.componentInstance.rows()).toHaveLength(1);
    expect(CdkVirtualScrollViewport.prototype.scrollToIndex).toHaveBeenCalledWith(0);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
