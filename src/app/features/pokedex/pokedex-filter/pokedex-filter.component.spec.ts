import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it } from 'vitest';
import { SEED_SPECIES } from '../../../core/data/pokedex-seed.data';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';
import { PokedexFilterComponent } from './pokedex-filter.component';

describe('PokedexFilterComponent', () => {
  async function setup(): Promise<{
    fixture: ComponentFixture<PokedexFilterComponent>;
    catalog: PokedexCatalogService;
  }> {
    TestBed.configureTestingModule({
      imports: [PokedexFilterComponent],
      providers: [PokedexCatalogService, provideNoopAnimations()],
    });
    const catalog = TestBed.inject(PokedexCatalogService);
    catalog.allSpecies.set([...SEED_SPECIES]);
    catalog.isLoading.set(false);
    const fixture = TestBed.createComponent(PokedexFilterComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, catalog };
  }

  it('updates search from the input and shows the live result count', async () => {
    const { fixture, catalog } = await setup();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'pika';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(catalog.searchTerm()).toBe('pika');
    expect(fixture.nativeElement.textContent).toContain('Exibindo 1 de 386 Pokémon');
  });

  it('filters Fairy types from the Fada chip', async () => {
    const { fixture, catalog } = await setup();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.type-chip'),
    ) as HTMLButtonElement[];
    const fairy = buttons.find((button) => button.textContent?.includes('Fada'));
    fairy?.click();
    fixture.detectChanges();

    expect(catalog.selectedType()).toBe('FAIRY');
    expect(catalog.filteredSpecies()).toHaveLength(17);
  });

  it('keeps type chips as native toggle buttons in a named group', async () => {
    const { fixture } = await setup();
    const group = fixture.nativeElement.querySelector('.type-chips') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Filtrar por tipo');
    const buttons = Array.from(group.querySelectorAll('button'));
    expect(buttons).toHaveLength(19);
    expect(buttons.every((button) => !button.hasAttribute('role'))).toBe(true);
    expect(buttons.every((button) => button.hasAttribute('aria-pressed'))).toBe(true);
  });
});
