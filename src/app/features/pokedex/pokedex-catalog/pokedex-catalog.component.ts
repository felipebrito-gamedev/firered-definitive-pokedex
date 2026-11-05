import { Component, computed, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { chunkSpeciesRows } from '../../../core/domain/catalog-filter';
import { Species } from '../../../core/domain/models/species.model';
import { UI_MESSAGES } from '../../../core/i18n/ui-messages';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';
import { PokedexStartupService } from '../../../core/pokedex/pokedex-startup.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokedexFilterComponent } from '../pokedex-filter/pokedex-filter.component';
import { SpeciesDetailComponent } from '../species-detail/species-detail.component';

@Component({
  selector: 'app-pokedex-catalog',
  imports: [ScrollingModule, MatButtonModule, PokemonCardComponent, PokedexFilterComponent],
  templateUrl: './pokedex-catalog.component.html',
  styleUrl: './pokedex-catalog.component.scss',
})
export class PokedexCatalogComponent {
  readonly catalog = inject(PokedexCatalogService);
  readonly startup = inject(PokedexStartupService);
  private readonly sheets = inject(MatBottomSheet);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly messages = UI_MESSAGES.catalog;
  readonly rowHeight = 280;
  readonly columnCount = signal(1);
  readonly rows = computed(() =>
    chunkSpeciesRows(this.catalog.filteredSpecies(), this.columnCount()),
  );
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  constructor() {
    effect((onCleanup) => {
      const viewport = this.viewport();
      if (!viewport) return;
      const element = viewport.elementRef.nativeElement as HTMLElement;
      const update = () => {
        this.columnCount.set(
          Math.max(1, Math.min(4, Math.floor((element.clientWidth + 12) / 180))),
        );
        viewport.checkViewportSize();
      };
      update();
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(update);
        observer.observe(element);
        onCleanup(() => observer.disconnect());
      }
    });
    effect(() => {
      this.rows();
      this.viewport()?.scrollToIndex(0);
    });
  }

  openDetails(species: Species): void {
    if (this.startup.status() !== 'ready') return;
    const trigger = this.document.activeElement;
    const sheet = this.sheets.open(SpeciesDetailComponent, {
      data: { species },
      ariaLabel: this.messages.detailAria(species.name),
      restoreFocus: true,
      autoFocus: 'first-tabbable',
    });
    sheet
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!trigger?.isConnected) {
          this.viewport()?.elementRef.nativeElement.focus();
        }
      });
  }

  retry(): void {
    void this.startup.initialize();
  }
}
