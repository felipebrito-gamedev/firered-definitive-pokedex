import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SEED_SPECIES } from '../../../core/data/pokedex-seed.data';
import { Species } from '../../../core/domain/models/species.model';
import { PokemonCardComponent } from './pokemon-card.component';

function speciesById(id: number): Species {
  const found = SEED_SPECIES.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`Missing species ${id}`);
  }
  return found;
}

describe('PokemonCardComponent', () => {
  async function create(species: Species): Promise<ComponentFixture<PokemonCardComponent>> {
    TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
    });
    const fixture = TestBed.createComponent(PokemonCardComponent);
    fixture.componentRef.setInput('species', species);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders padded number, name, types, and BST', async () => {
    const fixture = await create(speciesById(25));
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('#025');
    expect(text).toContain('Pikachu');
    expect(text).toContain('Elétrico');
    expect(text).toContain('BST 300');
  });

  it('emits the species when activated', async () => {
    const fixture = await create(speciesById(25));
    let emitted: Species | undefined;
    fixture.componentInstance.selected.subscribe((value) => {
      emitted = value;
    });
    fixture.nativeElement.querySelector('button')?.click();
    expect(emitted?.id).toBe(25);
  });
});
