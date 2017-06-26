/* eslint-env browser */

import { setChildren, setStyle } from 'redom';

import Grid from './grid';
import PuyoGameBase from './game-base';

import { NetworkGameEngine } from '../../common/engine';


export default class PuyoEndlessGame extends PuyoGameBase {
  constructor(socket) {
    super();

    this.el.classList.add('puyo-endless');

    this.socket = socket;
    this.playerGrid = null;
  }

  onEstablishConnection({ socket, game }) {
    this.engine = NetworkGameEngine.unserialize(game);
    this.engine.installSocket(socket);

    this.playerGrid = new Grid(this.engine.initialState);
    setChildren(this.el, this.playerGrid);
    this.playerGrid.installEventListeners();

    this.engine.on('puyoDropped', (effect) => {
      const grid = this.playerGrid;
      const x = effect.to % grid.width;
      const y = Math.floor(effect.to / grid.width);
      if (y < 0) {
        return;
      }
      const block = grid[y][x];
      const height = y - Math.max(0, Math.floor(effect.from / grid.width));
      const duration = Math.sqrt(height + 5) / 25;

      setStyle(block, { transform: `translateY(-${100 * height}%)`, transition: 'transform 0s' });
      window.setTimeout(() => {
        setStyle(block, { transform: 'translateY(0)', transition: `transform ${duration}s`, transitionTimingFunction: 'ease-in' });
      }, 15);
      window.setTimeout(() => {
        setStyle(block, { transform: '', transition: '', transitionTimingFunction: '' });
      }, 1000 * duration);

      if (!this.isAnimating) {
        this.isAnimating = true;
        window.setTimeout(() => {
          // Animation hack to shows preview ghosts.
          grid.previousState.chainNumber = this.originalChainNumber;
          grid.update();
          this.isAnimating = false;
        }, 1000 * duration);
      }
    }, false);
  }

  onClock({ time }) {
    if (!this.isRunning) {
      return;
    }
    if (this.isAnimating) {
      window.setTimeout(() => this.onClock({ time }), 200);
      return;
    }
    if (this.engine.time < time) {
      this.step();
    }
    if (this.engine.time < time) {
      window.setTimeout(() => this.onClock({ time }), 300);
    }
  }

  step() {
    const state = this.engine.step();

    // Animation hack to hide preview ghosts.
    this.originalChainNumber = state.chainNumber;
    state.chainNumber = true;

    this.playerGrid.update(state);
    this.playerGrid.piece.canPlay = this.engine.callStepper('canPlay');
  }
}