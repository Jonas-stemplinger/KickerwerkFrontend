import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiConfigurationError } from '../core/api-contract';
import { GameService } from '../core/game.service';
import { validateGameSelection } from '../core/game-validation';
import { GameRequest, PlayerOption } from '../core/models';

type PlayerSlot = 'greenOne' | 'greenTwo' | 'yellowOne' | 'yellowTwo';
type SelectedPlayers = Record<PlayerSlot, PlayerOption | null>;

@Component({
  selector: 'app-game-create-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game-create-page.html',
  styleUrl: './game-create-page.scss',
})
export class GameCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly games = inject(GameService);
  private readonly router = inject(Router);
  private searchSequence = 0;
  protected readonly greenSlots = ['greenOne', 'greenTwo'] as const;
  protected readonly yellowSlots = ['yellowOne', 'yellowTwo'] as const;
  protected readonly selectedPlayers = signal<SelectedPlayers>({
    greenOne: null, greenTwo: null, yellowOne: null, yellowTwo: null,
  });
  protected readonly searchResults = signal<PlayerOption[]>([]);
  protected readonly slotBeingSearched = signal<PlayerSlot | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.fb.group({
    greenOne: [''],
    greenTwo: [''],
    yellowOne: [''],
    yellowTwo: [''],
    winner: ['', Validators.required],
  });

  setSearch(slot: PlayerSlot, event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    this.slotBeingSearched.set(slot);
    const sequence = ++this.searchSequence;
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.games.searchPlayers(query).subscribe({
      next: (players) => {
        if (sequence !== this.searchSequence) {
          return;
        }
        const selected = Object.values(this.selectedPlayers()).flatMap((player) => player ? [player.id] : []);
        this.searchResults.set(players.filter((player) => !selected.includes(player.id)));
      },
      error: (error: unknown) => {
        if (sequence !== this.searchSequence) {
          return;
        }
        this.searchResults.set([]);
        this.error.set(error instanceof ApiConfigurationError
          ? 'Die Spielersuche ist noch nicht mit dem Backend verbunden.'
          : 'Spieler konnten nicht geladen werden.');
      },
    });
  }

  choosePlayer(slot: PlayerSlot, player: PlayerOption): void {
    this.searchSequence += 1;
    this.selectedPlayers.update((selected) => ({ ...selected, [slot]: player }));
    this.form.controls[slot].setValue(player.id);
    this.slotBeingSearched.set(null);
    this.searchResults.set([]);
    this.error.set('');
  }

  clearPlayer(slot: PlayerSlot): void {
    this.searchSequence += 1;
    this.selectedPlayers.update((selected) => ({ ...selected, [slot]: null }));
    this.form.controls[slot].setValue('');
  }

  submit(): void {
    this.error.set('');
    this.form.markAllAsTouched();
    const selected = Object.values(this.selectedPlayers()).flatMap((player) => player ? [player.id] : []);
    const selectedPlayers = this.selectedPlayers();
    const validationError = validateGameSelection(
      [selectedPlayers['greenOne']?.id ?? null, selectedPlayers['greenTwo']?.id ?? null],
      [selectedPlayers['yellowOne']?.id ?? null, selectedPlayers['yellowTwo']?.id ?? null],
      this.form.controls.winner.value,
    );
    if (this.form.invalid || validationError) {
      this.error.set(validationError ?? 'Bitte prüfe deine Eingaben.');
      return;
    }

    const request: GameRequest = {
      greenPlayerOneId: selectedPlayers['greenOne']?.id ?? null,
      greenPlayerTwoId: selectedPlayers['greenTwo']?.id ?? null,
      yellowPlayerOneId: selectedPlayers['yellowOne']?.id ?? null,
      yellowPlayerTwoId: selectedPlayers['yellowTwo']?.id ?? null,
      winner: this.form.controls.winner.value as 'green' | 'yellow',
    };
    this.busy.set(true);
    this.games.create(request).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigate(['/games']);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(error instanceof ApiConfigurationError
          ? 'Das Speichern ist noch nicht mit dem Backend verbunden.'
          : 'Das Spiel konnte nicht gespeichert werden. Bitte prüfe deine Eingaben und versuche es erneut.');
      },
    });
  }
}
