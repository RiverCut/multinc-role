
import { Component, Input } from '@angular/core';

const SpriteMap = {
  Attack: 'http://seiyria.com/gameicons-font/svg/broadsword.svg',
  Defend: 'http://seiyria.com/gameicons-font/svg/shield.svg',
  AttackAll: 'http://seiyria.com/gameicons-font/svg/sword-spin.svg'
};

@Component({
  selector: 'action-sprite',
  template: `<img [src]="url" class="action-sprite" />`,
  styles: [`
    .action-sprite {
      width: 48px;
      height: 48px;
    }
  `]
})
export class ActionSpriteComponent {

  @Input() public name: string;

  get url() {
    return SpriteMap[this.name] || 'http://seiyria.com/gameicons-font/svg/uncertainty.svg';
  }
}
