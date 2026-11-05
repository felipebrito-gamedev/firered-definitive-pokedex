import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it } from 'vitest';
import { SEED_EVOLUTION_RULES, SEED_SPECIES } from '../../../core/data/pokedex-seed.data';
import { Species } from '../../../core/domain/models/species.model';
import { EvolutionTreeService } from '../../../core/pokedex/evolution-tree.service';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';
import { SpeciesDetailComponent } from './species-detail.component';
import { buildEvolutionFamilyTree } from '../../../core/domain/evolution-tree';

function speciesById(id: number): Species {
  const found = SEED_SPECIES.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`Missing species ${id}`);
  }
  return found;
}

describe('SpeciesDetailComponent', () => {
  async function create(species: Species): Promise<ComponentFixture<SpeciesDetailComponent>> {
    const catalog = {
      allSpecies: () => [...SEED_SPECIES],
    };
    const trees = {
      getFamilyTree: (id: number) => buildEvolutionFamilyTree(id, SEED_EVOLUTION_RULES),
    };

    TestBed.configureTestingModule({
      imports: [SpeciesDetailComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PokedexCatalogService, useValue: catalog },
        { provide: EvolutionTreeService, useValue: trees },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { species } },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => undefined } },
      ],
    });

    const fixture = TestBed.createComponent(SpeciesDetailComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders base stats with Portuguese labels and numerical values', async () => {
    const fixture = await create(speciesById(4));
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Charmander');
    expect(text).toContain('Ataque');
    expect(text).toContain('Atq. Esp.');
    expect(text).toContain('Velocidade');
    expect(text).toContain('39');
    expect(text).toContain('309');
  });

  it('formats Kadabra’s ROM level-48 trigger with the hack callout', async () => {
    const fixture = await create(speciesById(64));
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Kadabra');
    expect(text).toContain('Alakazam');
    expect(text).toContain('Nível 48');
    expect(text).toContain('Alterado no FireRed Definitivo');
  });

  it('renders the sprite and replaces a failed image with an inline fallback', async () => {
    const fixture = await create(speciesById(25));
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.src).toBe(speciesById(25).spriteUrl);
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sprite-fallback')).not.toBeNull();
  });

  it('renders a fallback when no sprite is available and names every meter', async () => {
    const fixture = await create({ ...speciesById(25), spriteUrl: undefined });
    expect(fixture.nativeElement.querySelector('.sprite-fallback')).not.toBeNull();
    const meters = Array.from(
      fixture.nativeElement.querySelectorAll('[role="meter"]'),
    ) as HTMLElement[];
    expect(meters).toHaveLength(7);
    expect(meters.map((meter) => meter.getAttribute('aria-label'))).toEqual([
      'HP',
      'Ataque',
      'Defesa',
      'Atq. Esp.',
      'Def. Esp.',
      'Velocidade',
      'Total',
    ]);
  });
});
