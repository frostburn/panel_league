import { el, list } from 'redom';

import { dispatch } from './dispatch';


class GameInfo {
  constructor() {
    this.el = el('tr',
      this.gameModeDisplay = el('td'),
      this.playerCountDisplay = el('td')
    );

    this.el.onclick = (ev) => {
      ev.preventDefault();
      this.el.classList.toggle('selected');
    };

    this.el.ondblclick = (ev) => {
      ev.preventDefault();
      if (this.id && this.isJoinable) {
        dispatch(this, 'JoinGame', { id: this.id, mode: this.mode });
      }
    };
  }

  get isJoinable() {
    return this.playerCount < this.maximumPlayerCount;
  }

  update({ id, mode, playerCount, maximumPlayerCount }) {
    this.id = id;
    this.mode = mode;
    this.playerCount = playerCount;
    this.maximumPlayerCount = maximumPlayerCount;
    const maximumPlayerCountText = (maximumPlayerCount > 1000) ? '∞' : maximumPlayerCount;

    this.gameModeDisplay.innerText = `${this.mode}`;
    this.playerCountDisplay.innerText = `${this.playerCount} / ${maximumPlayerCountText}`;
  }
}


export default class Lobby {
  constructor(socket) {
    this.socket = socket;

    this.el = el('.lobby',
      el('',
        this.refreshButton = el('button', { type: 'button' }, 'Refresh'),
        this.createGameButton = el('button', { type: 'button' }, 'Create new game'),
        el('.select-container',
          this.gameModeSelect = el('select',
            el('option', { value: 'puyo:duel' }, 'Puyo duel'),
            el('option', { value: 'puyo:endless' }, 'Puyo endless'),
            el('option', { value: 'panel-league-duel' }, 'Panel League duel')
          )
        )
      ),
      el('table',
        el('thead',
          el('tr',
            el('th', 'Game mode'),
            el('th', 'Players')
          )
        ),
        this.games = list('tbody', GameInfo, 'id')
      )
    );

    this.refreshButton.onclick = (ev) => {
      ev.preventDefault();
      dispatch(this, 'RequestGameList');
    };

    this.createGameButton.onclick = (ev) => {
      ev.preventDefault();
      dispatch(this, 'CreateNewGame', { mode: this.gameModeSelect.value });
    };
  }

  onmount() {
    dispatch(this, 'RequestGameList');
  }

  onremount() {
    dispatch(this, 'RequestGameList');
  }

  update(games) {
    this.games.update(games);
  }
}